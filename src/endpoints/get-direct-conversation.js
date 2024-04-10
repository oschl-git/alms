/**
 * Handles the /get-direct-conversation endpoint.
 * Returns a conversation object with the provided employee, provided the employee exists.
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();
router.get('/:employeeUsername', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	// Ensure employee exists
	if (! await employees.isUsernameTaken(req.params.employeeUsername)) {
		res.status(404);
		res.json({
			error: 404,
			message: 'EMPLOYEE DOES NOT EXIST',
		});
		logger.warning(
			`${req.method} fail: Attempted to get direct message with ` +
			`a nonexistent employee at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	// Attempt to get already existing direct conversation
	let conversation = await conversations.getConversationBetweenTwoEmployees(
		employee.username, req.params.employeeUsername
	);

	// If the conversation doesn't exist, create it
	if (conversation === null) {
		await conversations.createNewConversationWithEmployees(
			null, [employee.username, req.params.employeeUsername]
		);

		conversation = await conversations.getConversationBetweenTwoEmployees(
			employee.username, req.params.employeeUsername
		);

		if (conversation === null) {
			throw new Error('Error getting direct conversation with another employee after creating it.');
		}
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(conversation);
}

module.exports = router; 