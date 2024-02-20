/**
 * Handles the /register endpoint
 */

const jsonValidation = require('../helpers/json-validation');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');
const package = require('../../package.json');
const passwordHasher = require('../helpers/password-hasher');

const router = express.Router();

router.post('/', async function (req, res) {
	const body = req.body;

	if (!jsonValidation.checkFieldsArePresent(body.username, body.name, body.surname, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'JSON FIELDS MISSING',
		});
		logger.warning(`POST fail: Required JSON fields missing at /register. (${req.ip})`);
		return;
	}

	if (!jsonValidation.checkFieldsAreString(body.username, body.name, body.surname, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'ALL FIELDS MUST BE STRING',
		});
		logger.warning(`POST fail: Not all fields are string at /register. (${req.ip})`);
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
		logger.warning(`POST fail: Fields did not match requirements for /register. (${req.ip})`);
		return;
	}

	if (await employees.isUsernameTaken(body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'USERNAME TAKEN',
		});
		logger.warning(`POST fail: Attempted to insert a taken username at /register. (${req.ip})`);
		return;
	}

	const hashedPassword = passwordHasher.hashPassword(body.password);

	try {
		await employees.addNewEmployee(
			body.username,
			body.name,
			body.surname,
			hashedPassword,
			req.ip
		);
	} catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL DATABASE ERROR',
		});
		logger.error(`POST error: Error adding employee to database at /register. (${req.ip})\n${e}`);
		return;
	}

	logger.success(`POST OK: Added new user at /register. (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "OK",
	});
});

function checkFieldsForErrors(body) {
	let errors = [];

	if (String(body.username).length < 2) {
		errors.push('Username must be longer than 2 characters.');
	}
	if (String(body.username).length > 32) {
		errors.push('Username must be shorter than 32 characters.');
	}
	if (String(body.name).length < 2) {
		errors.push('Name must be longer than 2 characters.');
	}
	if (String(body.name).length > 255) {
		errors.push('Name must be shorter than 255 characters.');
	}
	if (String(body.surname).length < 2) {
		errors.push('Surname must be longer than 2 characters.');
	}
	if (String(body.surname).length > 255) {
		errors.push('Surname must be shorter than 255 characters.');
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