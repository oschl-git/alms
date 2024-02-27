/**
 * Handles the /create-group-conversation endpoint
 */

const express = require('express');
const authenticator = require('../helpers/authenticator');
const jsonValidation = require('../helpers/json-validation');
const conversations = require('../database/gateways/conversation-gateway');
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
		logger.warning(`POST fail: Required JSON fields missing at /create-group-conversation. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreArray(body.employees)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'EMPLOYEES MUST BE ARRAY',
		});
		logger.warning(`POST fail: Employees field is not array at /create-group-conversation. (${req.ip})`);
		return;
	}

	const employees = body.employees.concat([employee.username]);
	const filteredEmployees = employees.filter((value, index) => employees.indexOf(value) === index);

	try {
		await conversations.createNewConversationWithEmployees(body.name, filteredEmployees);
	}
	catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL DATABASE ERROR',
		});
		logger.error(`POST error: Error creating new conversation at /create-group-conversation. (${req.ip})\n${e}`);
		return;
	}

	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
});

module.exports = router; 