const express = require('express')
const router = express.Router()
const crashesController = require('../controllers/crashesController')

router.route('/crashes/map')
    .get(crashesController.getCrashesMap)
router.route('/crashes/table')
    .get(crashesController.getCrashesTable)
router.route('/crashes/streetnames')
    .get(crashesController.getCrashesStreetNames)

module.exports = router