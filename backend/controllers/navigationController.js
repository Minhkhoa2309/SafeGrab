const { client } = require("../database/database");
const { point, featureCollection } = require("@turf/helpers");
const axios = require('axios');

async function getCrashesInPath(req, res) {
    try {
        const {coordinates, startDate, endDate} = req.query
        const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`, {
            params: {
                geometries: 'geojson',
                alternatives: true,
                steps: true,
                overview: 'full',
                access_token: process.env.MAP_BOX_ACCESS_TOKEN
            }
        });
        const data = response.data;
        
        if (data.routes && data.routes.length > 0) {
            const paths = data.routes.map((route) => route.legs[0].steps.map((step) => [step.maneuver.location, step.distance]));
            // Flattened the array and get only the unique values in it
            const flattenedPaths = paths.flat();
            const uniquePaths = new Set(flattenedPaths.map(step => JSON.stringify(step)));
            // Make a string to put into query
            const valuesString = Array.from(uniquePaths).map(stepStr => {
                const step = JSON.parse(stepStr);
                const coordinates = step[0];
                const distance = step[1];
                return `(${coordinates[0]}, ${coordinates[1]}, ${distance})`;
            }).join(",");

            const query = `
            WITH circles AS (
                SELECT 
                    ST_Buffer(
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, 
                        radius
                    )::geometry AS geom,
                    ST_AsText(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) AS point_text
                FROM (VALUES
                    ${valuesString}
                ) AS t(longitude, latitude, radius)
                ORDER BY geom ASC
            )
            SELECT
                circles.point_text AS point,
                COUNT(*) AS count
            FROM 
                crashes, circles
            WHERE 
                ST_Intersects(crashes.geom, circles.geom)
                AND crash_date >= '${startDate}' 
                AND crash_date < '${endDate}'
            GROUP BY
                circles.point_text;
            `;

            const result = await client.query(query);
            const features = result.rows.map((row) => {
                const pointString = row.point
                    .replace("POINT(", "")
                    .replace(")", "");
                const coordinates = pointString.split(" ");
                return point(coordinates, {
                    count: row.count,
                });
            });
            const geoJson = featureCollection(features);
            const routesData = data.routes.map((route) => route.geometry);
            const combinedData = {
                geoJson,
                routesData
            };
            res.status(200).json(combinedData);
        }
        else
        {
            throw Error("Mapbox API failed")
        }
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = {
    getCrashesInPath,
};