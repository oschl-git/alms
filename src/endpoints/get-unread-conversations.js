/**
 * Handles the /get-unread-conversations endpoint
 */

const express = require('express');
const logger = require('../logging/logger');
const conversations = require('../database/gateways/conversation-gateway');
const authenticator = require('../security/authenticator');

const router = express.Router();

router.get('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await conversations.getConversationsWithUnreadMessageCount(employee.id));
});

module.exports = router; 