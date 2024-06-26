/**
 * Handles the /get-all-employees endpoint.
 * Returns an array of all registered employees.
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();
router.get('/', (req, res) => { handleEndpoint(req, res, handle); });

async function handle(req, res) {
	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await employees.getAllEmployees());
}

module.exports = router; 