/**
 * Handles the /register endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const jsonValidation = require('../error_handling/json-validation');
const logger = require('../logging/logger');
const passwordHasher = require('../security/password-hasher');

const router = express.Router();
router.post('/', (req, res) => { handleEndpoint(req, res, handle); });

async function handle(req, res) {
	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.username, body.name, body.surname, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`${req.method} fail: Required JSON fields missing at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.username, body.name, body.surname, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'ALL FIELDS MUST BE STRING',
		});
		logger.warning(`${req.method} fail: Not all fields are string at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	const errors = checkFieldsForErrors(body);
	if (errors.length > 0) {
		res.status(400);
		res.json({
			error: 400,
			message: 'REQUIREMENTS NOT SATISFIED',
			errors: errors,
		});
		logger.warning(`${req.method} fail: Fields did not match requirements at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	if (await employees.isUsernameTaken(body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'USERNAME TAKEN',
		});
		logger.warning(`${req.method} fail: Attempted to insert a taken username at ${req.originalUrl}. (${req.ip})`);
		return;
	}

	const hashedPassword = passwordHasher.hashPassword(body.password);

	await employees.addNewEmployee(
		body.username,
		body.name,
		body.surname,
		hashedPassword,
		req.ip
	);
	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
}

function checkFieldsForErrors(body) {
	let errors = [];

	const pattern = /^[A-Za-z0-9]+$/;
	if (!pattern.test(body.username)) {
		errors.push('Username contains invalid characters. Only English letters and numbers are allowed.');
	}

	if (String(body.username).length < 2) {
		errors.push('Username must be longer than 2 characters.');
	}
	if (String(body.username).length > 32) {
		errors.push('Username must be shorter than 32 characters.');
	}
	if (String(body.name).length < 2) {
		errors.push('Name must be longer than 2 characters.');
	}
	if (String(body.name).length > 32) {
		errors.push('Name must be shorter than 32 characters.');
	}
	if (String(body.surname).length < 2) {
		errors.push('Surname must be longer than 2 characters.');
	}
	if (String(body.surname).length > 32) {
		errors.push('Surname must be shorter than 32 characters.');
	}

	errors = errors.concat(checkPasswordRequirements(body.password));

	return errors;
}

function checkPasswordRequirements(password) {
	let errors = [];

	if (String(password).length < 8) {
		errors.push('Password must be at least 8 characters long.');
	}
	if (String(password).length > 48) {
		errors.push('Password must be shorter than 49 characters.');
	}

	return errors;
}

module.exports = router; 