/**
 * Handles the /login endpoint
 */

const express = require('express');
const package = require('../../package.json');
const logger = require('../logging/logger');
const sessionTokens = require('../database/gateways/session-token-gateway');
const employees = require('../database/gateways/employee-gateway');
const passwordHasher = require('../helpers/password-hasher');

const router = express.Router();

router.post('/', async function (req, res) {
	const body = req.body;

	if (!checkRequiredFieldsPresent(body)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'Request JSON is missing required fields.',
		});
		logger.warning(`POST error: Required JSON fields missing at /login (${req.ip}).`);
		return;
	}

	const storedPassword = await employees.getStoredPassword(body.username);

	if (storedPassword === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'User does not exist.',
		});
		logger.warning(`POST error: User doesn't exist at /login (${req.ip}).`);
		return;
	}

	if (passwordHasher.isPasswordValid(body.password, storedPassword)) {
		const token = await sessionTokens.createAndReturnNewSessionToken();

		logger.success(`POST OK: /login. (${req.ip})`);
		res.status(200);
		res.json({
			token: token,
		});
	} else {
		res.status(401);
		res.json({
			error: 401,
			message: 'Incorrect password.',
		});
		logger.warning(`POST error: Incorrect password submitted for usre ${body.username} at /login (${req.ip}).`);
		return;
	}
});

function checkRequiredFieldsPresent(body) {
	if (!body.username) return false;
	if (!body.password) return false;
	return true;
}

module.exports = router; 