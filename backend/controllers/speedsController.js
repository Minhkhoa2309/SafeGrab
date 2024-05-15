const { client } = require("../database/database");
const { point, featureCollection } = require("@turf/helpers");

async function getSpeedViolationsMap(req, res) {
    try {
        const { gridSize, boundingBox, startDate, endDate } = req.query;
        let bb = JSON.parse(boundingBox);
        const query = `SELECT 
        ST_AsText(ST_SnapToGrid(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), ${gridSize})) AS snapped_point,
        count(*) AS count
    FROM 
        speed_cam
    WHERE 
        ST_Intersects(
            ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), 
            ST_GeomFromText('POLYGON((${bb[0][0]} ${bb[0][1]}, ${bb[1][0]} ${bb[1][1]}, ${bb[2][0]} ${bb[2][1]}, ${bb[3][0]} ${bb[3][1]}, ${bb[0][0]} ${bb[0][1]}))')
        )
        AND violation_date >= '${startDate}' 
        AND violation_date < '${endDate}'
    GROUP BY 
        ST_SnapToGrid(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), ${gridSize});`;
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

async function getTotalViolations(startDate, endDate) {
    try {
        let query = `SELECT COUNT(*) FROM speed_cam WHERE violation_date >= '${startDate}' AND violation_date < '${endDate}';`;
        const result = await client.query(query);
        return Number(result.rows[0].count);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getSpeedViolationsTable(req, res) {
    try {
        const { startDate, endDate, pageSize, pageIndex } = req.query;
        const limit = pageSize;
        const offset = (pageIndex - 1) * pageSize;
        let query = `SELECT address, violation_date, violation_count FROM redlight_cam WHERE crash_date >= '${startDate}' AND crash_date < '${endDate}' LIMIT ${limit} OFFSET ${offset};`;
        const result = await client.query(query);

        const violations = result.rows.map((row) => {
            return {
                address: row.address,
                violationDate: row.violation_date,
                violationCount: row.violation_count,
            };
        });

        const totalViolations = await getTotalViolations(
            startDate,
            endDate
        );
        const jsonResponse = {
            violations,
            total: totalViolations,
        };
        res.status(200).json(jsonResponse);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = {
    getSpeedViolationsMap,
    getSpeedViolationsTable
};
