const redlights = require("../redlight.json");
const { point, featureCollection } = require("@turf/helpers");

function getRedlightViolationsCluster(req, res) {
    const features = {}
    redlights.forEach((violation) => {
        const coordinates = [Number(violation.LONGITUDE), Number(violation.LATITUDE)];
        if (!(violation["CAMERA ID"] in features)) {
            features[violation["CAMERA ID"]] = point(coordinates, {
                cameraId: violation["CAMERA ID"],
                address: violation.ADDRESS,
                intersection: violation.INTERSECTION,
                violations: Number(violation.VIOLATIONS),
            });
        } 
        else {
            features[violation["CAMERA ID"]].properties.violations += Number(violation.VIOLATIONS);
        }
    });
    const geoJson = featureCollection(features);
    res.status(200).json(geoJson);
}

module.exports = {
    getRedlightViolationsCluster,
};
