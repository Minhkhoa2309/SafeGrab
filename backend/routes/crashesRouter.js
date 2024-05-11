const express = require('express')
const router = express.Router()
const crashesController = require('../controllers/crashesController')

router.route('/crashes/cluster')
    .get(crashesController.getCrashesCluster)

module.exports = router