/**
 * Handles the /add-employee-to-group endpoint.
 * This endpoint adds an employee to an already existing group conversation.
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');

const router = express.Router();
router.post('/', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	const body = req.body;

	// Ensure all required fields are present
	if (!jsonValidation.checkFieldsArePresent(body.conversationId, body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure conversationId is int
	if (!jsonValidation.checkFieldsAreInteger(body.conversationId)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONVERSATION ID MUST BE INT',
		});
		logger.warning(`${req.method} fail: ConversationId field is not int at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure username is string
	if (!jsonValidation.checkFieldsAreString(body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'USERNAME MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Username field is not string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure employee has access to the conversation
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

	// Ensure conversation is a group
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

	// Ensure username is not taken
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

	// Ensure employee is not already part of conversation (avoids duplicate records)
	let employeeId = await employees.getEmployeeIdByUsername(body.username);
	if (await conversations.doesEmployeeHaveAccess(employeeId, body.conversationId)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'EMPLOYEE ALREADY IN CONVERSATION',
		});
		logger.warning(
			`${req.method} fail: Client attempted adding an employee to ` +
			`a group conversation that they already have access to at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	// Add employee
	await conversations.addNewConversationEmployeeRelation(body.conversationId, body.username);

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
};

module.exports = router; 