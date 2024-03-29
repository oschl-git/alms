/**
 * Handles the /get-conversation-by-id endpoint
 */

const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();

router.get('/:id', async function (req, res) {
	const id = req.params.id;

	const conversation = await conversations.getConversationById(id);

	if (conversation == null) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONVERSATION DOES NOT EXIST',
		});
		logger.warning(
			`${req.method} fail: Attempted to get nonexistent conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json();
});

module.exports = router; 