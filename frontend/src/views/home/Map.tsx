import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

import { useForm, Controller } from 'react-hook-form';
import { Box, Button, CircularProgress, FormControl, Grid, TextField, useTheme } from '@mui/material';
import CustomCheckbox from 'src/@core/components/custom-checkbox';

interface FormInputs {
    startLocation: string
    endLocation: string
}

const defaultValues = {
    startLocation: '',
    endLocation: ''
}

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [routes, setRoutes] = useState<GeoJSON.LineString[] | null>(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';
    const [crashLayerVisible, setCrashLayerVisible] = useState<boolean>(true);
    const [speedLayerVisible, setSpeedLayerVisible] = useState<boolean>(true);
    const [redlightLayerVisible, setRedlightLayerVisible] = useState<boolean>(true);
    const theme = useTheme();

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<FormInputs>({ defaultValues })

    const onSubmit = async (location: FormInputs) => {
        try {
            setLoading(true)
            const { startLocation, endLocation } = location;

            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation};${endLocation}?geometries=geojson&alternatives=true&steps=true&overview=full&&access_token=${accessToken}`);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const routesData = data.routes.map((route: any) => route.geometry);

                setSelectedRouteIndex(0);

                setRoutes(routesData);
            } else {
                alert('No route found.');
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            alert('Error fetching directions.');
        }
        setLoading(false)
    }

    const fetchLayer = useCallback(async () => {
        if (!map) return;

        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.geojson`
        )
            .then(response => response.json())
            .then((data: GeoJSON.FeatureCollection<GeoJSON.Geometry>) => {
                // Remove existing layer and source if they exist
                if (map.getSource('crash-data')) {
                    map.removeLayer('crash-data-layer');
                    map.removeSource('crash-data');
                }
                // Add the GeoJSON as a source to the map
                map.addSource('crash-data', {
                    type: 'geojson',
                    data: data
                });

                // Add a layer to display the GeoJSON data
                map.addLayer({
                    id: 'crash-data-layer',
                    type: 'circle',
                    source: 'crash-data',
                    paint: {
                        'circle-color': theme.palette.error.main,
                        'circle-opacity': 0.8,
                        'circle-radius': 3
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching Crash data:', error);
            });

        await fetch(
            `https://data.cityofchicago.org/resource/spqx-js37.geojson`
        )
            .then(response => response.json())
            .then(data => {
                // Remove existing layer and source if they exist
                if (map.getSource('redlight-data')) {
                    map.removeLayer('redlight-data-layer');
                    map.removeSource('redlight-data');
                }
                // Add the GeoJSON as a source to the map
                map.addSource('redlight-data', {
                    type: 'geojson',
                    data: data
                });

                // Add a layer to display the GeoJSON data
                map.addLayer({
                    id: 'redlight-data-layer',
                    type: 'circle',
                    source: 'redlight-data',
                    paint: {
                        'circle-color': theme.palette.warning.main,
                        'circle-opacity': 0.8,
                        'circle-radius': 3
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

        await fetch(
            `https://data.cityofchicago.org/resource/hhkd-xvj4.geojson`
        )
            .then(response => response.json())
            .then(data => {
                // Remove existing layer and source if they exist
                if (map.getSource('speed-data')) {
                    map.removeLayer('speed-data-layer');
                    map.removeSource('speed-data');
                }

                // Add the GeoJSON as a source to the map
                map.addSource('speed-data', {
                    type: 'geojson',
                    data: data
                });

                // Add a layer to display the GeoJSON data
                map.addLayer({
                    id: 'speed-data-layer',
                    type: 'circle',
                    source: 'speed-data',
                    paint: {
                        'circle-color': theme.palette.info.main,
                        'circle-opacity': 0.8,
                        'circle-radius': 3
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [map]);

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        const initializedMap = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: { lng: -87.6, lat: 41.8 },
            zoom: 9
        });
        setMap(initializedMap);

        // initializedMap.on('load', () => {
        //     // Add any initializations that depend on the map being loaded
        //     initializedMap.addSource('custom-tileset', {
        //         type: 'vector',
        //         url: `mapbox://supoleo.dr5wghdf`
        //     });

        //     initializedMap.addLayer({
        //         id: 'custom-tileset-layer',
        //         type: 'circle',
        //         source: 'custom-tileset',
        //         'source-layer': 'stations-9zu36c', // Replace with your source layer name
        //         paint: {
        //             'circle-color': '#d60000',
        //             'circle-opacity': 1,
        //             'circle-radius': 3
        //         }
        //     });
        // });


        return () => {
            initializedMap.remove();
        };
    }, []);


    useEffect(() => {
        if (map && routes && selectedRouteIndex !== null) {
            // Add click event listener at the map level
            map.on('click', (e) => {
                const clickedFeature = map.queryRenderedFeatures(e.point, { layers: ['route-layer'] });

                if (clickedFeature.length > 0) {
                    const clickedRouteIndex = Number(clickedFeature[0].properties?.index);
                     // Select the clicked route
                     selectRoute(clickedRouteIndex);
                }
            });

            routes.forEach((routeData, index) => {
                const sourceId = `route-${index}`;
                const lineColor = index === selectedRouteIndex ? '#A0A0A0' : '#72E128';

                if (map.getSource(sourceId)) {
                    const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routeData.coordinates
                        }
                    };

                    (map.getSource(sourceId) as GeoJSONSource).setData(geojson);
                } else {
                    map.addLayer({
                        id: sourceId,
                        type: 'line',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: routeData
                            }
                        },
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': lineColor,
                            'line-width': 8,
                            'line-opacity': 0.75
                        }
                    });
                }
            });
        }
    }, [map, routes, selectedRouteIndex]);

    useEffect(() => {
        fetchLayer();
    }, [fetchLayer]);

    const toggleCrashLayerVisibility = () => {
        setCrashLayerVisible(!crashLayerVisible);
        if (map && map.getLayer('crash-data-layer')) {
            map.setLayoutProperty('crash-data-layer', 'visibility', crashLayerVisible ? 'none' : 'visible');
        }
    };

    const toggleRedlightLayerVisibility = () => {
        setRedlightLayerVisible(!redlightLayerVisible);
        if (map && map.getLayer('redlight-data-layer')) {
            map.setLayoutProperty('redlight-data-layer', 'visibility', redlightLayerVisible ? 'none' : 'visible');
        }
    };

    const toggleSpeedLayerVisibility = () => {
        setSpeedLayerVisible(!speedLayerVisible);
        if (map && map.getLayer('speed-data-layer')) {
            map.setLayoutProperty('speed-data-layer', 'visibility', speedLayerVisible ? 'none' : 'visible');
        }
    };

    const selectRoute = (index: number) => {
        if (!map) return;
        if (index !== selectedRouteIndex) {
            // Change the color of the previously selected route to gray
            if (selectedRouteIndex !== null) {
                const previousSourceId = `route-${selectedRouteIndex}`;
                map.setPaintProperty(previousSourceId, 'line-color', '#A0A0A0');
            }

            // Change the color of the newly selected route to green
            const newSourceId = `route-${index}`;
            map.setPaintProperty(newSourceId, 'line-color', '#72E128');

            setSelectedRouteIndex(index);
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
                <Grid container spacing={4}>
                    <Grid item sm={2} xs={4} >
                        <CustomCheckbox
                            title='Traffic Crashes'
                            handleChange={toggleCrashLayerVisibility}
                            selected={crashLayerVisible}
                            color='error'
                        />
                    </Grid>
                    <Grid item sm={2} xs={4} >
                        <CustomCheckbox
                            title='Redlight Violations'
                            handleChange={toggleRedlightLayerVisibility}
                            selected={redlightLayerVisible}
                            color='warning'
                        />
                    </Grid>
                    <Grid item sm={2} xs={4} >
                        <CustomCheckbox
                            title='Speed Violations'
                            handleChange={toggleSpeedLayerVisibility}
                            selected={speedLayerVisible}
                            color='info'
                        />
                    </Grid>


                </Grid>
            </Grid>
            <Grid item xs={12} sm={12}>
                <Box sx={{ position: 'absolute', background: 'rgba(255, 255, 255, 0.8)', zIndex: 1, padding: '10px', borderRadius: '5px', mt: '5px', ml: '20px' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={5}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <Controller
                                        name='startLocation'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                value={value}
                                                label='Start Location'
                                                onChange={onChange}
                                                error={Boolean(errors.startLocation)}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <Controller
                                        name='endLocation'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                value={value}
                                                label='End Location'
                                                onChange={onChange}
                                                placeholder='Carter'
                                                error={Boolean(errors.endLocation)}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={4} sx={{ alignContent: 'center' }}>
                                <Button size='large' type='submit' variant='contained'>
                                    {loading ? (
                                        <CircularProgress
                                            sx={{
                                                color: 'common.white',
                                                width: '20px !important',
                                                height: '20px !important',
                                                mr: theme => theme.spacing(2)
                                            }}
                                        />
                                    ) : null}
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
                <div ref={mapContainerRef} style={{ width: '100%', height: '70vh' }} />
            </Grid>
        </Grid>
    )
};

export default Map;
