/**
 * Handles the /get-direct-conversation endpoint
 */

const authenticator = require('../security/authenticator');
const conversations = require('../database/gateways/conversation-gateway');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();

router.get('/:employeeUsername', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

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

	let conversation = await conversations.getConversationBetweenTwoEmployees(
		employee.username, req.params.employeeUsername
	);

	if (conversation === null) {
		await conversations.createNewConversationWithEmployees(
			null, [employee.username, req.params.employeeUsername]
		);

		conversation = await conversations.getConversationBetweenTwoEmployees(
			employee.username, req.params.employeeUsername
		);

		if (conversation === null) {
			res.status(500);
			res.json({
				error: 500,
				message: 'INTERNAL ALMS ERROR',
			});
			logger.error(
				`${req.method} error: Failed getting conversation after creating it at ${req.originalUrl}. (${req.ip})`
			);
			return;
		}
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(conversation);
});

module.exports = router; 