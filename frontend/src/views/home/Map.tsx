import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, CircularProgress, FormControl, FormHelperText, Grid, TextField } from '@mui/material';
import Icon from 'src/@core/components/icon';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { findRoutes } from 'src/store/navigation';
import { format, subMonths } from 'date-fns';

interface FormInputs {
    startLocation: {
        location: string
        location_name: string
    }
    endLocation: {
        location: string
        location_name: string
    }
}

const defaultValues = {
    startLocation: {
        location: '',
        location_name: ''
    },
    endLocation: {
        location: '',
        location_name: ''
    },
};


const schema = yup.object().shape({
    startLocation: yup.object().shape({
        location: yup.string().required(),
        location_name: yup.string().required(),
    }),
    endLocation: yup.object().shape({
        location: yup.string().required(),
        location_name: yup.string().required(),
    }),
})

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [routes, setRoutes] = useState<GeoJSON.LineString[] | null>(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors }
    } = useForm<FormInputs>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const onSubmit = async (location: FormInputs) => {
        try {
            setLoading(true)
            const { startLocation, endLocation } = location;
            if (map && routes) {
                routes.forEach((_, index) => {
                    const sourceId = `route-${index}`;
                    if (map.getLayer(sourceId)) {
                        map.removeLayer(sourceId);
                        map.removeSource(sourceId);
                    }
                });
            }
            const crashPoints = await dispatch(findRoutes({
                coordinates: `${startLocation.location};${endLocation.location}`,
                startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd')
            }))
            if (crashPoints.payload) {
                console.log(crashPoints.payload);
                const routesData = crashPoints.payload.routesData;

                setSelectedRouteIndex(0);

                setRoutes(routesData);

                if (map && map.getSource('clusters')) {
                    // Update source data
                    const source = map.getSource('clusters') as mapboxgl.GeoJSONSource;
                    source.setData(crashPoints.payload.geoJson);
                }
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            toast.error("Error fetching directions")
        }
        setLoading(false)
    }

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        const initializedMap = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: { lng: -87.6, lat: 41.8 },
            zoom: 9
        });
        setMap(initializedMap);
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            reverseGeocode: true,
            flipCoordinates: true,
            language: 'en',
            marker: false
        });

        initializedMap.addControl(geocoder, 'top-right');

        initializedMap.on('load', () => {
            // Add cluster and point layers
            initializedMap.addSource('clusters', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
                clusterProperties: {
                    sum: ["+", ["to-number", ["get", "count", ["properties"]]]],
                },
            });

            initializedMap.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'clusters',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ["get", "sum"],
                        '#51bbd6',
                        100,
                        'rgb(255, 255, 0)',
                        1000,
                        'rgb(255, 0, 0)',
                    ],
                    'circle-radius': ['step', ["get", "sum"], 20, 100, 30, 1000, 40],
                },
            });

            initializedMap.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'clusters',
                filter: ['has', 'point_count'],
                layout: {
                    "text-field": ["get", "sum"],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                },
            });

            initializedMap.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'clusters',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': 'rgb(255, 0, 0)',
                    'circle-radius': 4,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff',
                },
            });


            initializedMap.on('mouseenter', 'unclustered-point', (e) => {
                if (!e.features || e.features[0].geometry.type !== 'Point') return;
                const coordinates = e.features[0].geometry.coordinates.slice();
                const count = e.features[0].properties?.count || 0;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup({ closeOnMove: true })
                    .setLngLat({ lng: coordinates[0], lat: coordinates[1] })
                    .setHTML(`Crash Count: ${count}`)
                    .addTo(initializedMap);
            });

            initializedMap.on('mouseenter', 'clusters', () => {
                initializedMap.getCanvas().style.cursor = 'pointer';
            });

            initializedMap.on('mouseleave', 'clusters', () => {
                initializedMap.getCanvas().style.cursor = '';
            });
        })

        initializedMap.on('click', async (e) => {
            const coords = e.lngLat.toArray();
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng}, ${e.lngLat.lat}.json?types=address&access_token=${accessToken}`)
            const data = await response.json();

            const point: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: coords
                        }
                    }
                ]
            };

            if (!getValues('startLocation').location) {
                setValue('startLocation', { location: `${e.lngLat.lng}, ${e.lngLat.lat}`, location_name: data.features[0].place_name });
                if (initializedMap.getLayer('start')) {
                    (initializedMap.getSource('start') as GeoJSONSource).setData(point);
                } else {
                    initializedMap.addLayer({
                        id: 'start',
                        type: 'circle',
                        source: {
                            type: 'geojson',
                            data: point
                        },
                        paint: {
                            'circle-radius': 10,
                            'circle-color': '#3887be'
                        }
                    });
                }

            } else {
                setValue('endLocation', { location: `${e.lngLat.lng}, ${e.lngLat.lat}`, location_name: data.features[0].place_name });
                if (initializedMap.getLayer('end')) {
                    (initializedMap.getSource('end') as GeoJSONSource).setData(point);
                } else {
                    initializedMap.addLayer({
                        id: 'end',
                        type: 'circle',
                        source: {
                            type: 'geojson',
                            data: point
                        },
                        paint: {
                            'circle-radius': 10,
                            'circle-color': '#f30'
                        }
                    });
                }
            }
        });

        return () => {
            initializedMap.remove();
        };
    }, []);


    useEffect(() => {
        if (map && routes && selectedRouteIndex !== null) {

            routes.forEach((routeData, index) => {
                const sourceId = `route-${index}`;
                const lineColor = index === selectedRouteIndex ? '#72E128' : '#A0A0A0';

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

            // Bring the selected route to the front
            if (map.getLayer(`route-${selectedRouteIndex}`) && map.getLayer(`unclustered-point`)) {
                map.moveLayer(`route-${selectedRouteIndex}`);
                map.moveLayer(`unclustered-point`);
                map.moveLayer(`clusters`);
                map.moveLayer(`cluster-count`);
            }
        }
    }, [map, routes, selectedRouteIndex]);

    const resetRoute = () => {
        if (map) {
            // Remove start and end markers
            if (map.getLayer('start')) {
                map.removeLayer('start');
                map.removeSource('start');
            }
            if (map.getLayer('end')) {
                map.removeLayer('end');
                map.removeSource('end');
            }

            // Remove all route layers
            if (routes) {
                routes.forEach((_, index) => {
                    const sourceId = `route-${index}`;
                    if (map.getLayer(sourceId)) {
                        map.removeLayer(sourceId);
                        map.removeSource(sourceId);
                    }
                });
            }
            if (map.getSource('clusters')) {
                // Update source data
                const source = map.getSource('clusters') as mapboxgl.GeoJSONSource;
                source.setData({ type: 'FeatureCollection', features: [] });
            }
        }

        // Reset form
        reset();
        setRoutes(null);
        setSelectedRouteIndex(null);
    };

    const switchRoute = () => {
        if (routes && routes.length > 0) {
            setSelectedRouteIndex((prevIndex) => {
                const newIndex = (prevIndex === null ? 0 : prevIndex + 1) % routes.length;

                // Update route colors
                routes.forEach((_, index) => {
                    const sourceId = `route-${index}`;
                    const lineColor = index === newIndex ? '#72E128' : '#A0A0A0';

                    if (map && map.getLayer(sourceId)) {
                        map.setPaintProperty(sourceId, 'line-color', lineColor);
                    }
                });

                return newIndex;
            });
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
                <Box sx={{ position: 'absolute', background: 'rgba(255, 255, 255, 0.8)', zIndex: 1, padding: '10px', borderRadius: '5px', mt: '5px', ml: '20px', width: '40%' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={5}>
                            <Grid item xs={12} sm={7}>
                                <FormControl fullWidth>
                                    <Controller
                                        name='startLocation'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                value={value.location_name}
                                                label='Start Location'
                                                onChange={onChange}
                                                error={Boolean(errors.startLocation)}
                                                InputProps={{ readOnly: true }}
                                            />
                                        )}
                                    />
                                    {errors.startLocation && (
                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-last-name'>
                                            Required Field
                                        </FormHelperText>
                                    )}
                                </FormControl>
                                <FormControl fullWidth sx={{ mt: 3 }}>
                                    <Controller
                                        name='endLocation'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                value={value.location_name}
                                                label='End Location'
                                                onChange={onChange}
                                                error={Boolean(errors.endLocation)}
                                                InputProps={{ readOnly: true }}
                                            />
                                        )}
                                    />
                                    {errors.endLocation && (
                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-last-name'>
                                            Required Field
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3} sx={{ mt: 2 }}>
                                <Grid container>
                                    <Grid item xs={12}>
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
                                            ) : <Icon icon='mdi:directions' />}
                                            Directions
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Button size='small' color='success' variant='contained' sx={{ mt: 5 }} disabled={!routes || routes.length <= 1} onClick={() => switchRoute()}>
                                            Switch
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Button size='small' color='secondary' variant='outlined' sx={{ mt: 5, ml:8 }} onClick={() => resetRoute()}>
                                            Clear
                                        </Button>
                                    </Grid>
                                    
                                </Grid>
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
