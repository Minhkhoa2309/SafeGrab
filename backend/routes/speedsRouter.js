const express = require('express')
const router = express.Router()
const speedsController = require('../controllers/speedsController')

router.route('/speeds/map')
    .get(speedsController.getSpeedViolationsMap)
router.route('/speeds/table')
    .get(speedsController.getSpeedViolationsTable)

module.exports = router