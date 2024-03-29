/**
 * Handles the /get-conversation endpoint
 */

const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();

router.get('/:id', async function (req, res) {
	const id = req.params.id;

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await conversations.getConversationById(id));
});

module.exports = router; 