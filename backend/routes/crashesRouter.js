const express = require('express')
const router = express.Router()
const crashesController = require('../controllers/crashesController')

router.route('/crashes/map')
    .get(crashesController.getCrashesMap)
router.route('/crashes/table')
    .get(crashesController.getCrashesTable)

module.exports = router