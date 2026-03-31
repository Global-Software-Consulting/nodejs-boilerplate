const whatsappController = require('./whatsapp.controller');
const whatsappService = require('./whatsapp.service');
const whatsappValidation = require('./whatsapp.validation');
const whatsappRoutes = require('./whatsapp.routes');
const WhatsAppMessage = require('./whatsapp.model');

module.exports = {
  whatsappController,
  whatsappService,
  whatsappValidation,
  whatsappRoutes,
  WhatsAppMessage,
};
