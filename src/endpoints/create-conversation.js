/**
 * Handles the index /create-conversation endpoint
 */

const express = require('express');
const package = require('../../package.json');
const logger = require('../logging/logger');
const authenticator = require('../helpers/authenticator');

const router = express.Router();

router.post('/', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	res.status(200);
	res.json({
		status: 'OK',
		employee: employee,
	});
});

module.exports = router; 