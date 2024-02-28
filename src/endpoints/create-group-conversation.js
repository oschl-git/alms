/**
 * Handles the /create-group-conversation endpoint
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

	if (!jsonValidation.checkFieldsArePresent(body.name, body.employees)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreArray(body.employees)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'EMPLOYEES MUST BE ARRAY',
		});
		logger.warning(`${req.method} fail: Employees field is not array at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (await conversations.doesConversationExist(body.name)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONVERSATION NAME TAKEN',
		});
		logger.warning(
			`${req.method} fail: ` +
			`Attempted to insert a conversation with a taken name at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	const employees = body.employees.concat([employee.username]);
	const filteredEmployees = [...new Set(employees)];

	const nonexistentUsernames = await getNonexistentUsernames(filteredEmployees);

	if (nonexistentUsernames.length > 0) {
		res.status(400);
		res.json({
			error: 400,
			message: 'EMPLOYEES DO NOT EXIST',
			employees: nonexistentUsernames,
		});
		logger.warning(`${req.method} fail: At least some employees do not exist at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	try {
		await conversations.createNewConversationWithEmployees(body.name, filteredEmployees);
	}
	catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL DATABASE ERROR',
		});
		logger.error(
			`${req.method} error: Error adding new conversation to database at ${req.originalUrl}. (${req.ip})\n${e}`
		);
		return;
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
});

async function getNonexistentUsernames(usernames) {
	let nonexistentUsernames = [];

	for (const username of usernames) {
		if (! await employees.isUsernameTaken(username)) {
			nonexistentUsernames.push(username);
		}
	}

	return nonexistentUsernames;
}

module.exports = router; 