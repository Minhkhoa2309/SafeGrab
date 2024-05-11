const express = require('express')
const router = express.Router()
const congestionsRouter = require('../controllers/congestionsController')

router.route('/congestions/cluster')
    .get(congestionsRouter.getCongestionsCluster)

module.exports = router