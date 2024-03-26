/**
 * Handles the /is-username-taken endpoint
 */

const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();

router.get('/:username', async function (req, res) {
	const username = req.params.username;

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await employees.isUsernameTaken(username));
});

module.exports = router; 