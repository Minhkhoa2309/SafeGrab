import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

import { useForm, Controller } from 'react-hook-form';
import { Box, Button, CircularProgress, FormControl, Grid, TextField } from '@mui/material';
import Icon from 'src/@core/components/icon';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

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

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
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

        initializedMap.on('click', (e) => {
            const coords = e.lngLat.toArray();
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

            if (!getValues('startLocation')) {
                setValue('startLocation', `${e.lngLat.lng}, ${e.lngLat.lat}`);
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

            } else if (!getValues('endLocation')) {
                setValue('endLocation', `${e.lngLat.lng}, ${e.lngLat.lat}`);
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
            if (map.getLayer(`route-${selectedRouteIndex}`)) {
                map.moveLayer(`route-${selectedRouteIndex}`);
            }
        }
    }, [map, routes, selectedRouteIndex]);

    return (
        <Grid container spacing={3}>
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
                                    ) : <Icon icon='mdi:directions' />}
                                    Directions
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
