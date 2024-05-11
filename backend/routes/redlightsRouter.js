const express = require('express')
const router = express.Router()
const redlightsController = require('../controllers/redlightsController')

router.route('/redlights/cluster')
    .get(redlightsController.getRedlightViolationsCluster)

module.exports = router