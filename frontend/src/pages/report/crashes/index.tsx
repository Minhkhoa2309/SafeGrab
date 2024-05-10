import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Grid } from '@mui/material';
import CrashTable from 'src/views/report/crash/CrashTable';


const CrashReport = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';
    const [rows, setRows] = useState<any[]>([])
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
    const [total, setTotal] = useState<number>(0)

    const fetchTableData = useCallback(async () => {
        if (!map) return;

        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.json?$limit=${paginationModel.pageSize}&$offset=${paginationModel.page}`
        )
            .then(response => response.json())
            .then(data => {
                // Remove existing layer and source if they exist
                if (map.getSource('crash-data')) {
                    map.removeLayer('crash-data-layer');
                    map.removeSource('crash-data');
                }

                // Create a GeoJSON object from the response data
                const geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: data.map((feature: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(feature.longitude), parseFloat(feature.latitude)]
                        },
                        properties: {
                            id: feature.crash_record_id
                        }
                    }))
                };

                // Add the GeoJSON as a source to the map
                map.addSource('crash-data', {
                    type: 'geojson',
                    data: geojson
                });

                // Add a layer to display the GeoJSON data
                map.addLayer({
                    id: 'crash-data-layer',
                    type: 'circle',
                    source: 'crash-data',
                    paint: {
                        'circle-color': '#d60000',
                        'circle-opacity': 0.8,
                        'circle-radius': 3
                    }
                });

                setRows(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [paginationModel, map]);

    const fetchTotalCount = useCallback(async () => {
        if (!map) return;

        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.json?$select=count(*) as total`
        ).then(response => response.json())
            .then(data => {
                setTotal(Number(data[0].total))
            })
            .catch(error => {
                console.error('Error fetching Total:', error);
            });
    }, [map])

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        const initializedMap = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: { lng: -87.6, lat: 41.8 },
            zoom: 9
        });
        setMap(initializedMap);

        return () => {
            initializedMap.remove();
        };
    }, []);

    useEffect(() => {
        fetchTotalCount();
        fetchTableData();
    }, [fetchTotalCount, fetchTableData, paginationModel])


    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sm={12}>
                <CrashTable data={rows} total={total} paginationModel={paginationModel} setPaginationModel={setPaginationModel} />
            </Grid>
            <Grid item xs={12} sm={12}>
                <div ref={mapContainerRef} style={{ width: '100%', height: '70vh' }} />
            </Grid>
        </Grid>
    )
};

export default CrashReport;
