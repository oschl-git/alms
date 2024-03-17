/**
 * Handles the /send-message endpoint
 */

const authenticator = require('../security/authenticator');
const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');
const messages = require('../database/gateways/message-gateway');

const router = express.Router();

router.post('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

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

	try {
		await messages.addNewMessage(employee.id, body.conversationId, body.content);

		logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
		res.status(200);
		res.json({
			response: 200,
			message: "OK",
		});
	}
	catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL DATABASE ERROR',
		});
		logger.error(
			`${req.method} error: Error adding new message to database at ${req.originalUrl}. (${req.ip})\n${e}`
		);
	}
});

module.exports = router; 