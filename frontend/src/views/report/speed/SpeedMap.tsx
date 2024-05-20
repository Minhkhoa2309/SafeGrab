import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { DateType } from 'src/types/DatepickerTypes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { format } from 'date-fns';
import { fetchDataMap } from 'src/store/speeds';
import { getCellSize } from 'src/layouts/utils/getCellSize';
import { FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';

interface filterProps {
    startDate: DateType
    endDate: DateType
}

const SpeedMap = ({ startDate, endDate }: filterProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';
    const [mapZoom, setMapZoom] = useState(9);
    const [mapBounds, setMapBounds] = useState<number[][]>([
        [
            -88.5,
            41.5
        ],
        [
            -86.5,
            42.0
        ]
    ]);
    const [mapType, setMapType] = useState<string>('datapoint')

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        const initializedMap = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: { lng: -87.6, lat: 41.8 },
            zoom: mapZoom,
            bounds: [mapBounds[0][0], mapBounds[0][1], mapBounds[1][0], mapBounds[1][1]]
        });
        setMap(initializedMap);

        initializedMap.on('load', () => {
            initializedMap.addControl(new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl
            }));
            initializedMap.addControl(new mapboxgl.NavigationControl());
            initializedMap.addControl(new mapboxgl.FullscreenControl());
            initializedMap.on('moveend', () => {
                const bounds = initializedMap.getBounds().toArray();
                setMapBounds(bounds)
            });

            initializedMap.on('zoomend', () => {
                const zoomLevel = initializedMap.getZoom();
                setMapZoom(Math.floor(zoomLevel))
            });

            initializedMap.on('click', 'unclustered-point', (e) => {
                if (!e.features || e.features[0].geometry.type != 'Point') return
                const coordinates = e.features[0].geometry.coordinates.slice();
                const count = e.features[0].properties?.count | 0;

                // Ensure that if the map is zoomed out such that
                // multiple copies of the feature are visible, the
                // popup appears over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat({ lng: coordinates[0], lat: coordinates[1] })
                    .setHTML(
                        `Crash Count: ${count}`
                    )
                    .addTo(initializedMap);
            });

            initializedMap.on('mouseenter', 'clusters', () => {
                initializedMap.getCanvas().style.cursor = 'pointer';
            });
            initializedMap.on('mouseleave', 'clusters', () => {
                initializedMap.getCanvas().style.cursor = '';
            });

            // Add cluster layers
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
                        1000,
                        '#f1f075',
                        10000,
                        '#f28cb1',
                    ],
                    'circle-radius': ['step', ["get", "sum"], 20, 1000, 30, 10000, 40],
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
                    'circle-color': '#11b4da',
                    'circle-radius': 4,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff',
                },
            });

            // Add heatmap layer
            initializedMap.addLayer({
                id: 'heatmap',
                type: 'heatmap',
                source: 'clusters',
                maxzoom: 15,
                paint: {
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'sum'],
                        0, 1,
                        1000, 1
                    ],
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        15, 3
                    ],
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0, 0, 255, 0)',
                        0.2, 'rgb(65, 105, 225)',
                        0.4, 'rgb(0, 255, 255)',
                        0.6, 'rgb(0, 255, 0)',
                        0.8, 'rgb(255, 255, 0)',
                        1, 'rgb(255, 0, 0)'
                    ],
                    'heatmap-radius': ['step', ["get", "sum"], 50, 1000, 75, 10000, 100],
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7, 1,
                        15, 1
                    ],
                }
            });

            // Hide heatmap layer by default
            initializedMap.setLayoutProperty('heatmap', 'visibility', 'none');
        })


        return () => {
            initializedMap.remove();
        };
    }, []);

    useEffect(() => {
        if (!map || !startDate || !endDate) {
            return;
        }
        const cellSize = getCellSize(mapZoom);
        const formattedStartDate = format(startDate as Date | number, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate as Date | number, 'yyyy-MM-dd');
        dispatch(
            fetchDataMap({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                gridSize: cellSize,
                boundingBox: JSON.stringify([
                    [mapBounds[0][0], mapBounds[0][1]],
                    [mapBounds[0][0], mapBounds[1][1]],
                    [mapBounds[1][0], mapBounds[1][1]],
                    [mapBounds[1][0], mapBounds[0][1]]
                ])
            })
        ).then((response) => {
            if (response.payload && map.getSource('clusters')) {
                // Update source data
                const source = map.getSource('clusters') as mapboxgl.GeoJSONSource;
                source.setData(response.payload);
            }
        }).catch(error => {
            console.error('Error fetching Map:', error);
        });
    }, [dispatch, startDate, endDate, mapZoom, mapBounds])

    const handleChangeMapType = (event: ChangeEvent<HTMLInputElement>) => {
        const type = (event.target as HTMLInputElement).value;
        if (map) {
            if (type === 'datapoint') {
                map.setLayoutProperty('clusters', 'visibility', 'visible');
                map.setLayoutProperty('cluster-count', 'visibility', 'visible');
                map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
                map.setLayoutProperty('heatmap', 'visibility', 'none');
            } else {
                map.setLayoutProperty('clusters', 'visibility', 'none');
                map.setLayoutProperty('cluster-count', 'visibility', 'none');
                map.setLayoutProperty('unclustered-point', 'visibility', 'none');
                map.setLayoutProperty('heatmap', 'visibility', 'visible');
            }
        }
        setMapType(type);
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Typography>Point Aggregation</Typography>
                <RadioGroup row aria-label='controlled' name='controlled' value={mapType} onChange={handleChangeMapType}>
                    <FormControlLabel value='datapoint' control={<Radio />} label='Datapoint' />
                    <FormControlLabel value='heatmap' control={<Radio />} label='Heatmap' />
                </RadioGroup>
            </Grid>
            <Grid item xs={12}>
                <div ref={mapContainerRef} style={{ width: '100%', height: '70vh' }} />
            </Grid>
        </Grid>
    );
};

export default SpeedMap;
