const { client } = require("../database/database");
const { point, featureCollection } = require("@turf/helpers");

async function getCrashesMap(req, res) {
    try {
        const { gridSize, boundingBox, startDate, endDate, streetName } = req.query;
        let bb = JSON.parse(boundingBox);
        let query = `SELECT 
        ST_AsText(ST_SnapToGrid(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), ${gridSize})) AS snapped_point,
        count(*) AS count
    FROM 
        crashes
    WHERE 
        ST_Intersects(
            ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), 
            ST_GeomFromText('POLYGON((${bb[0][0]} ${bb[0][1]}, ${bb[1][0]} ${bb[1][1]}, ${bb[2][0]} ${bb[2][1]}, ${bb[3][0]} ${bb[3][1]}, ${bb[0][0]} ${bb[0][1]}))')
        )
        AND crash_date >= '${startDate}' 
        AND crash_date < '${endDate}' `
    if (streetName) {
        query += `AND street_name = '${streetName}' `
    }
    query += `GROUP BY 
        ST_SnapToGrid(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), ${gridSize});`;
        console.log(query)
        const result = await client.query(query);
        const features = result.rows.map((row) => {
            const pointString = row.snapped_point
                .replace("POINT(", "")
                .replace(")", "");
            const coordinates = pointString.split(" ");
            return point(coordinates, {
                count: row.count,
            });
        });
        const geoJson = featureCollection(features);
        res.status(200).json(geoJson);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getTotalCrashes(streetName, startDate, endDate) {
    try {
        let query = `SELECT COUNT(*) FROM crashes WHERE crash_date >= '${startDate}' AND crash_date < '${endDate}'`;
        if (streetName) {
            query += ` AND street_name = '${streetName}'`;
        }
        query += `;`;
        const result = await client.query(query);
        return Number(result.rows[0].count);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getCrashesTable(req, res) {
    try {
        const { streetName, startDate, endDate, pageSize, pageIndex } = req.query;
        const limit = pageSize;
        const offset = pageIndex * pageSize;
        let query = `SELECT crash_record_id, street_name, crash_date, prim_contributory_cause, weather_condition, lighting_condition FROM crashes WHERE crash_date >= '${startDate}' AND crash_date < '${endDate}'`;
        if (streetName) {
            query += ` AND street_name = '${streetName}'`;
        }
        query += ` LIMIT ${limit} OFFSET ${offset};`;
        const result = await client.query(query);

        const crashes = result.rows.map((row) => {
            return {
                id: row.crash_record_id,
                streetName: row.street_name,
                crashDate: row.crash_date,
                primaryCause: row.prim_contributory_cause,
                weatherCondition: row.weather_condition,
                lightingCondition: row.lighting_condition,
            };
        });

        const totalCrashes = await getTotalCrashes(
            streetName,
            startDate,
            endDate
        );
        const jsonResponse = {
            crashes,
            total: totalCrashes,
        };
        res.status(200).json(jsonResponse);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getCrashesStreetNames(req, res) {
    try {
        let query = `SELECT DISTINCT ON (street_name) crash_record_id, street_name FROM crashes;`;
        const result = await client.query(query);
        const streetNames = result.rows.map((row) => {
            return {
                id: row.crash_record_id,
                streetName: row.street_name,
            };
        });
        res.status(200).json(streetNames);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = {
    getCrashesTable,
    getCrashesMap,
    getCrashesStreetNames,
};
