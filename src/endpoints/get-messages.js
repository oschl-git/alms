/**
 * Handles the /get-messages endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const encryptor = require('../security/message-encryptor');
const express = require('express');
const logger = require('../logging/logger');
const messages = require('../database/gateways/message-gateway');

const router = express.Router();
router.get('/:conversationId', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	const params = req.params;

	if (! await conversations.doesEmployeeHaveAccess(employee.id, params.conversationId)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'CONVERSATION NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Client attempted getting messages for ` +
			`an invalid conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	const retrievedMessages = await messages.getMessagesFromConversation(params.conversationId);
	const decryptedMessages = encryptor.decryptMessageObjectArray(retrievedMessages);

	await messages.markMessagesAsRead(employee.id, decryptedMessages);

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(decryptedMessages);
}

module.exports = router; 