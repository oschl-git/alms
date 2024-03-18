/**
 * Handles the /get-messages endpoint
 */

const express = require('express');
const logger = require('../logging/logger');
const messages = require('../database/gateways/message-gateway');
const conversations = require('../database/gateways/conversation-gateway');
const authenticator = require('../security/authenticator');

const router = express.Router();

router.get('/:conversationId', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	const params = req.params;

	if (! await conversations.doesEmployeeHaveAccess(employee.id, params.conversationId)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'CONVERSATION NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Client attempted getting messages ` +
			`an invalid conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}


	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		conversations: await messages.getMessagesFromConversation(params.conversationId),
	});
});

module.exports = router; 