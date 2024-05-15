const express = require('express')
const router = express.Router()
const redlightsController = require('../controllers/redlightsController')

router.route('/redlights/map')
    .get(redlightsController.getRedlightViolationsMap)
router.route('/redlights/table')
    .get(redlightsController.getRedlightViolationsTable)

module.exports = router