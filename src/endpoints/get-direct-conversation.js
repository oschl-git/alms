/**
 * Handles the /get-direct-conversation endpoint
 */

const express = require('express');
const logger = require('../logging/logger');
const conversations = require('../database/gateways/conversation-gateway');
const authenticator = require('../security/authenticator');

const router = express.Router();

router.get('/:employeeUsername', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	let conversation = await conversations.getConversationBetweenTwoEmployees(
		employee.username, req.params.employeeUsername
	);

	if (conversation === null) {
		const conversationId = await conversations.createNewConversationWithEmployees(
			null, [employee.username, req.params.employeeUsername]
		);
		conversation = await conversations.getConversationById(conversationId);

		if (conversation === null) {
			res.status(500);
			res.json({
				error: 500,
				message: 'INTERNAL DATABASE ERROR',
			});
			logger.error(
				`${req.method} error: Failed getting conversation after creating it at ${req.originalUrl}. (${req.ip})`
			);
		}
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		conversation: conversation,
	});
});

module.exports = router; 