const express = require('express');
const { authRoutes } = require('./auth');
const { userRoutes } = require('./user');
const { twilioRoutes } = require('./twilio');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/twilio', twilioRoutes);

module.exports = router;
