/**
 * Handles the /create-group-conversation endpoint.
 * This endpoint creates a new group conversation.
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

	// Ensure required fields are present
	if (!jsonValidation.checkFieldsArePresent(body.name, body.employees)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure employees field is array
	if (!jsonValidation.checkFieldsAreArray(body.employees)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'EMPLOYEES MUST BE ARRAY',
		});
		logger.warning(`${req.method} fail: Employees field is not array at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure name is not longer than 16 characters
	if (body.name.length > 16) {
		res.status(400);
		res.json({
			error: 400,
			message: 'NAME TOO LONG',
		});
		logger.warning(`${req.method} fail: Conversation name was too long at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Add current user
	const employees = body.employees.concat([employee.username]);

	// Ensure conversation doesn't have more than 100 employees
	if (employees.length > 100) {
		res.status(400);
		res.json({
			error: 400,
			message: 'TOO MANY PARTICIPANTS',
		});
		logger.warning(`${req.method} fail: Too many participants provided at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Remove duplicates
	const filteredEmployees = [...new Set(employees)];

	// Check for usernames that don't exist
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

	// Create conversation
	const conversationId = await conversations.createNewConversationWithEmployees(body.name, filteredEmployees);

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		conversationId: conversationId,
	});
}

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