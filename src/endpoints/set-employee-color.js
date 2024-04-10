/**
 * Handles the /set-employee-color endpoint.
 * Allows employees to set their own display colour in conversations.
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');

const router = express.Router();
router.post('/', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	const body = req.body;

	// Ensure colour field is present
	if (!jsonValidation.checkFieldsArePresent(body.color)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'COLOR JSON FIELD MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON color field missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure colour field is integer
	if (!jsonValidation.checkFieldsAreInteger(body.color)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'COLOR MUST BE INTEGER',
		});
		logger.warning(`${req.method} fail: Color field is not int at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Ensure colour field is a valid colour number
	if (body.color < 0 || body.color > 15) {
		res.status(400);
		res.json({
			error: 400,
			message: 'INVALID COLOR',
		});
		logger.warning(`${req.method} fail: Color field is not a valid color at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	// Set employee colour in database
	await employees.setEmployeeColor(employee.id, body.color);

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
}

module.exports = router; 