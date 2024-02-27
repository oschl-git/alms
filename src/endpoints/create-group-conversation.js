/**
 * Handles the /create-group-conversation endpoint
 */

const express = require('express');
const authenticator = require('../helpers/authenticator');
const jsonValidation = require('../helpers/json-validation');

const router = express.Router();

router.post('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.name, body.users)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`POST fail: Required JSON fields missing at /create-group-conversation. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreArray(body.users)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'USERS MUST BE ARRAY',
		});
		logger.warning(`POST fail: Users field is not array at /create-group-conversation. (${req.ip})`);
		return;
	}

	res.status(200);
	res.json({
		status: 'OK',
		employee: employee,
	});
});

module.exports = router; 