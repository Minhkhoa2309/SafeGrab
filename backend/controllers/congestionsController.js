const congestions = require('../data/congestion.json')
const { point, featureCollection } = require("@turf/helpers");

function getCongestionsCluster(req, res) {
    const features = congestions.map((congestion) => {
        const coordinates = [(Number(congestion.START_LONGITUDE) + Number(congestion.END_LONGITUDE)) / 2, (Number(congestion.START_LATITUDE) + Number(congestion.END_LATITUDE)) / 2];
        return point(coordinates, {
            segmentId: congestion.SEGMENTID,
            street: congestion.STREET,
            direction: congestion.DIRECTION,
            fromStreet: congestion.FROM_STREET,
            toStreet: congestion.TO_STREET,
            length: congestion.LENGTH,
            streetHeading: congestion.STREET_HEADING
        })
    });

    const geoJson = featureCollection(features)
    res.status(200).json(geoJson)
}

module.exports = {
    getCongestionsCluster,
};
