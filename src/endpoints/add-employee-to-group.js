/**
 * Handles the /add-employee-to-group endpoint
 */

const authenticator = require('../security/authenticator');
const conversations = require('../database/gateways/conversation-gateway');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');

const router = express.Router();

router.post('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.conversationId, body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'USERNAME MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Username field is not string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (! await conversations.doesEmployeeHaveAccess(employee.id, body.conversationId)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'CONVERSATION NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Client attempted adding an employee to ` +
			`an invalid group conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	if (! await conversations.isConversationGroup(body.conversationId)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONVERSATION NOT GROUP',
		});
		logger.warning(
			`${req.method} fail: Client attempted adding an employee to ` +
			`a conversation that isn't a group at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	if (! await employees.isUsernameTaken(body.username)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'EMPLOYEE NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Client attempted adding an nonexistent employee to ` +
			`a group conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	try {
		await conversations.addNewConversationEmployeeRelation(body.conversationId, body.username);

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
			message: 'INTERNAL ALMS ERROR',
		});
		logger.error(
			`${req.method} error: Error adding new conversation employee relation to ' +
			'database at ${req.originalUrl}. (${req.ip})\n${e}`
		);
	}
});

module.exports = router; 