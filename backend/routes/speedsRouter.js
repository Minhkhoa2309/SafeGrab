const express = require('express')
const router = express.Router()
const speedsController = require('../controllers/speedsController')

router.route('/speeds/cluster')
    .get(speedsController.getSpeedViolationsCluster)

module.exports = router