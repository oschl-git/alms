/**
 * Handles the /register endpoint
 */

const { checkAllFieldsAreString } = require('../helpers/check-fields-are-string');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');
const package = require('../../package.json');
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
		logger.warning(`POST error: Required JSON fields missing at /register (${req.ip}).`);
		return;
	}

	if (!checkAllFieldsAreString(body.username, body.name, body.surname, body.password)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'All fields must be of type string.',
		});
		logger.warning(`POST error: Not all fields are string at /register. (${req.ip})`);
		return;
	}

	const errors = checkFieldsForErrors(body);
	if (errors.length > 0) {
		res.status(400);
		res.json({
			error: 400,
			message: 'Fields in request JSON do not match requirements.',
			errors: errors,
		});
		logger.warning(`POST error: Fields did not match requirements for /register. (${req.ip})`);
		return;
	}

	if (await employees.isUsernameTaken(body.username)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'Username is already taken.',
		});
		logger.warning(`POST error: Attempted to insert a taken username at /register. (${req.ip})`);
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
			message: 'Error adding employee to database.',
		});
		logger.error(`POST error: Error adding employee to database at /register. (${req.ip})`);
		return;
	}

	logger.success(`POST OK: Added new user at /register. (${req.ip})`);
	res.status(200);
	res.json({
		response: 200,
		message: "User successfully added.",
	});
});

function checkRequiredFieldsPresent(body) {
	if (!body.username) return false;
	if (!body.name) return false;
	if (!body.surname) return false;
	if (!body.password) return false;
	return true;
}

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
		errors.push('Password must be longer than 8 characters.');
	}
	if (String(password).length > 48) {
		errors.push('Password must be shorter than 48 characters.');
	}

	return errors;
}

module.exports = router; 