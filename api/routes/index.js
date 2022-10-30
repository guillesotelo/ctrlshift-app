const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const movementRoutes = require('./movement')
const ledgerRoutes = require('./ledger')

const revealRoutes = require('./reveal')

router.use('/movement', movementRoutes)
router.use('/user', userRoutes)
router.use('/ledger', ledgerRoutes)

router.use('/gender-reveal', revealRoutes)

module.exports = router