const { client } = require("../database/database");
const { point, featureCollection } = require("@turf/helpers");

async function getRedlightViolationsMap(req, res) {
    try {
        const { gridSize, boundingBox, startDate, endDate, intersection } = req.query;
        let bb = JSON.parse(boundingBox);
        let query = `SELECT 
        ST_AsText(ST_SnapToGrid(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), ${gridSize})) AS snapped_point,
        count(*) AS count
    FROM 
        redlight_cam
    WHERE 
        ST_Intersects(
            ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')'), 
            ST_GeomFromText('POLYGON((${bb[0][0]} ${bb[0][1]}, ${bb[1][0]} ${bb[1][1]}, ${bb[2][0]} ${bb[2][1]}, ${bb[3][0]} ${bb[3][1]}, ${bb[0][0]} ${bb[0][1]}))')
        )
        AND violation_date >= '${startDate}' 
        AND violation_date < '${endDate}' `
    if (intersection) {
        query += `AND intersection = '${intersection}' `
    }
    query += `GROUP BY 
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

async function getTotalViolations(intersection, startDate, endDate) {
    try {
        let query = `SELECT COUNT(*) FROM redlight_cam WHERE violation_date >= '${startDate}' AND violation_date < '${endDate}'`;
        if (intersection) {
            query += ` AND intersection = '${intersection}'`;
        }
        query += `;`;
        const result = await client.query(query);
        return Number(result.rows[0].count);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getRedlightViolationsTable(req, res) {
    try {
        const { intersection, startDate, endDate, pageSize, pageIndex } = req.query;
        const limit = pageSize;
        const offset = pageIndex * pageSize;
        let query = `SELECT id, address, intersection, violation_date, violations FROM redlight_cam WHERE violation_date >= '${startDate}' AND violation_date < '${endDate}'`;
        if (intersection) {
            query += ` AND intersection = '${intersection}'`;
        }
        query += ` LIMIT ${limit} OFFSET ${offset};`;
        const result = await client.query(query);

        const violations = result.rows.map((row) => {
            return {
                id: row.id,
                address: row.address,
                intersection: row.intersection,
                violationDate: row.violation_date,
                violationCount: row.violations,
            };
        });

        const totalViolations = await getTotalViolations(
            intersection,
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

async function getRedlightViolationsIntersections(req, res) {
    try {
        let query = `SELECT DISTINCT ON (intersection) id, intersection FROM redlight_cam;`;
        const result = await client.query(query);
        const intersections = result.rows.map((row) => {
            return {
                id: row.id,
                intersection: row.intersection,
            };
        });
        res.status(200).json(intersections);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = {
    getRedlightViolationsMap,
    getRedlightViolationsTable,
    getRedlightViolationsIntersections,
};
