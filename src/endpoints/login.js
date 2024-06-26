/**
 * Handles the /login endpoint.
 * Handles authenticating users.
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');
const passwordHasher = require('../security/password-hasher');
const sessionTokens = require('../database/gateways/session-token-gateway');

const router = express.Router();
router.post('/', (req, res) => { handleEndpoint(req, res, handle); });

async function handle(req, res) {
	const body = req.body;

	// Ensure all required fields are present
	if (!jsonValidation.checkFieldsArePresent(body.username, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure all required fields are string
	if (!jsonValidation.checkFieldsAreString(body.username, body.password)) {
		res.json({
			error: 400,
			message: 'ALL FIELDS MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Not all fields are string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Get employee object
	const employee = await employees.getEmployeeObjectByUsername(body.username);

	// If employee is null, return that it doesn't exist
	if (employee === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'USER DOES NOT EXIST',
		});
		logger.warning(`${req.method} fail: User doesn't exist at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure supplied password is correct
	if (!passwordHasher.doPasswordsMatch(body.password, employee.password)) {
		res.status(401);
		res.json({
			error: 401,
			message: 'INCORRECT PASSWORD',
		});
		logger.warning(
			`${req.method} fail: ` +
			`Incorrect password submitted for user ${body.username} at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	// Generate and get new session token
	let token = await sessionTokens.createAndReturnNewSessionToken(employee.id);

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);

	// Return token and employee object
	res.status(200);
	res.json({
		token: token,
		employee: {
			id: employee.id,
			username: employee.username,
			name: employee.name,
			surname: employee.surname,
		},
	});
}

module.exports = router; 