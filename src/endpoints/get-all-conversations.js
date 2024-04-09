/**
 * Handles the /get-all-conversations endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();
router.get('/', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await conversations.getAllConversationsWithParticipantsForEmployee(employee.id));
}

module.exports = router; 