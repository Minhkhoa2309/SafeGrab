import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

const CrashMap = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';
    const [mapZoom, setMapZoom] = useState(9);
    const [mapBounds, setMapBounds] = useState<number[][]>([]);
    const zoomLevels = [4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    const cellSizes = [0.5, 0.25, 0.125, 0.06, 0.03, 0.015, 0.008, 0.004, 0.002, 0.0001, 0.0005, 0.00025, 0.000125, 0.00006, 0.00003, 0.000015];

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        const initializedMap = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: { lng: -87.6, lat: 41.8 },
            zoom: mapZoom
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
                const count = e.features[0].properties?.__count__ | 0;

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
        })


        return () => {
            initializedMap.remove();
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!map) return;
        const cellSize = getCellSize(mapZoom);

        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.geojson?$query=select snap_to_grid(location,${cellSize}),min(:id) as __row_id__,count(*) as __count__ where intersects(location, 'POLYGON((${mapBounds[0][0]} ${mapBounds[0][1]},${mapBounds[0][0]} ${mapBounds[1][1]},${mapBounds[1][0]} ${mapBounds[1][1]},${mapBounds[1][0]} ${mapBounds[0][1]},${mapBounds[0][0]} ${mapBounds[0][1]}))') group by snap_to_grid(location,${cellSize}) limit 50000 &$$query_timeout_seconds=60&$$read_from_nbe=true&$$version=2.1&$$app_token=U29jcmF0YS0td2VraWNrYXNz0`
        ).then(response => response.json())
            .then(data => {

                // Remove existing layer and source if they exist
                if (map.getSource('clusters')) {
                    map.removeLayer('clusters');
                    map.removeLayer('unclustered-point');
                    map.removeLayer('cluster-count');
                    map.removeSource('clusters');
                }
                // Add cluster layers
                map.addSource('clusters', {
                    type: 'geojson',
                    data: data,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                    clusterProperties: {
                        sum: ["+", ["to-number", ["get", "__count__", ["properties"]]]],
                    },
                });

                map.addLayer({
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

                map.addLayer({
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

                map.addLayer({
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

            })
            .catch(error => {
                console.error('Error fetching Total:', error);
            });
    }, [mapZoom, mapBounds])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const getCellSize = (zoom: number): number => {
        for (let i = 0; i < zoomLevels.length; i++) {
            if (zoom <= zoomLevels[i]) {
                return cellSizes[i];
            }
        }

        return 0.000015;
    };


    return (
        <div ref={mapContainerRef} style={{ width: '100%', height: '70vh' }} />
    )
};

export default CrashMap;
