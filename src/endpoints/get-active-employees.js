/**
 * Handles the /get-active-employees endpoint
 */

const express = require('express');
const logger = require('../logging/logger');
const employees = require('../database/gateways/employee-gateway');

const router = express.Router();

router.get('/', async function (req, res) {
	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await employees.getActiveEmployees());
});

module.exports = router; 