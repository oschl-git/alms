/**
 * Handles the /login endpoint
 */

const jsonValidation = require('../helpers/json-validation');
const express = require('express');
const package = require('../../package.json');
const logger = require('../logging/logger');
const sessionTokens = require('../database/gateways/session-token-gateway');
const employees = require('../database/gateways/employee-gateway');
const passwordHasher = require('../helpers/password-hasher');

const router = express.Router();

router.post('/', async function (req, res) {
	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.username, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`POST fail: Required JSON fields missing at /login. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.username, body.password)) {
		res.json({
			error: 400,
			message: 'ALL FIELDS MUST BE STRING',
		});
		logger.warning(`POST fail: Not all fields are string at /login. (${req.ip})`);
		return;
	}

	const employee = await employees.getEmployeeObjectByUsername(body.username);

	if (employee === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'USER DOES NOT EXIST',
		});
		logger.warning(`POST fail: User doesn't exist at /login. (${req.ip})`);
		return;
	}

	if (passwordHasher.isPasswordValid(body.password, employee.password)) {
		let token = null;
		try {
			token = await sessionTokens.createAndReturnNewSessionToken(employee.id);
		} catch (e) {
			res.status(500);
			res.json({
				error: 500,
				message: 'INTERNAL DATABASE ERROR',
			});
			logger.error(`POST error: Error adding new session token at /login. (${req.ip})\n${e}`);
			return;
		}

		logger.success(`POST OK: /login. (${req.ip})`);

		res.status(200);
		res.json({
			token: token,
			employee: {
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
		logger.warning(`POST fail: Incorrect password submitted for user ${body.username} at /login. (${req.ip})`);
		return;
	}
});

module.exports = router; 