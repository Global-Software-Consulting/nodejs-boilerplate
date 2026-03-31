const express = require('express');
const { authRoutes } = require('./auth');
const { userRoutes } = require('./user');
const { whatsappRoutes } = require('./whatsapp');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/whatsapp', whatsappRoutes);

module.exports = router;
