const express = require('express');
const { authRoutes } = require('./auth');
const { userRoutes } = require('./user');
const { stripeRoutes } = require('./stripe');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stripe', stripeRoutes);

module.exports = router;
