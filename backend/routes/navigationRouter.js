const express = require('express')
const router = express.Router()
const navigationController = require('../controllers/navigationController')

router.route('/navigation')
    .get(navigationController.getCrashesInPath)

module.exports = router