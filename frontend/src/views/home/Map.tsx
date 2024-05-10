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
    const [route, setRoute] = useState<GeoJSON.LineString | null>(null);
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

            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation};${endLocation}?steps=true&geometries=geojson&access_token=${accessToken}`);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const routeData = data.routes[0].geometry;
                setRoute(routeData);
            } else {
                setRoute(null);
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
        if (map && route) {
            if (map.getSource('route')) {
                const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: route.coordinates
                    }
                };

                (map.getSource('route') as GeoJSONSource).setData(geojson);
            } else {
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: route
                        }
                    },
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#72E128',
                        'line-width': 8,
                        'line-opacity': 0.75
                    }
                });
            }

        }
    }, [map, route]);

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
