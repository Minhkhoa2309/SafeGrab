const express = require('express')
const router = express.Router()
const testController = require('../controllers/testController')

router.route('/test')
    .get(testController.getHbase)

module.exports = router