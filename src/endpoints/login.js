/**
 * Handles the /login endpoint
 */

const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');
const package = require('../../package.json');
const passwordHasher = require('../security/password-hasher');
const sessionTokens = require('../database/gateways/session-token-gateway');

const router = express.Router();

router.post('/', async function (req, res) {
	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.username, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.username, body.password)) {
		res.json({
			error: 400,
			message: 'ALL FIELDS MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Not all fields are string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	const employee = await employees.getEmployeeObjectByUsername(body.username);

	if (employee === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'USER DOES NOT EXIST',
		});
		logger.warning(`${req.method} fail: User doesn't exist at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (passwordHasher.doPasswordsMatch(body.password, employee.password)) {
		let token = null;
		try {
			token = await sessionTokens.createAndReturnNewSessionToken(employee.id);
		}
		catch (e) {
			res.status(500);
			res.json({
				error: 500,
				message: 'INTERNAL DATABASE ERROR',
			});
			logger.error(
				`${req.method} error: ` +
				`Error adding new session token to database at ${req.originalUrl}. (${req.ip})\n${e}`
			);
			return;
		}

		logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
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
	} else {
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
});

module.exports = router; 