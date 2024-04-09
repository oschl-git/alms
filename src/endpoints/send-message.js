/**
 * Handles the /send-message endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const encryptor = require('../security/message-encryptor');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');
const messages = require('../database/gateways/message-gateway');

const router = express.Router();
router.post('/', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.conversationId, body.content)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.content)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONTENT MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Content field is not string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (body.content.length > 500) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONTENT TOO LONG',
		});
		logger.warning(`${req.method} fail: Content field was too long at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (! await conversations.doesEmployeeHaveAccess(employee.id, body.conversationId)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'CONVERSATION NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Client attempted sending a message to ` +
			`an invalid conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	let encryptedContent = encryptor.encrypt(body.content);

	await messages.addNewMessage(employee.id, body.conversationId, encryptedContent);
	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
}

module.exports = router; 