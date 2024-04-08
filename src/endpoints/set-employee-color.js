/**
 * Handles the /set-employee-color endpoint
 */

const authenticator = require('../security/authenticator');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');

const router = express.Router();

router.post('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.color)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'COLOR JSON FIELD MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON color field missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreInteger(body.color)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'COLOR MUST BE INTEGER',
		});
		logger.warning(`${req.method} fail: Color field is not int at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (body.color < 0 || body.color > 15) {
		res.status(400);
		res.json({
			error: 400,
			message: 'INVALID COLOR',
		});
		logger.warning(`${req.method} fail: Color field is not a valid color at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	try {
		await employees.setEmployeeColor(employee.id, body.color);

		logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
		res.status(200);
		res.json({
			response: 200,
			message: "OK",
		});
	}
	catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL ALMS ERROR',
		});
		logger.error(
			`${req.method} error: Error setting employee color at ${req.originalUrl}. (${req.ip})\n${e}`
		);
	}
});

module.exports = router; 