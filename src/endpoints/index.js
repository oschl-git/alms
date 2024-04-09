/**
 * Handles the index (/) endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const employees = require('../database/gateways/employee-gateway');
const express = require('express');
const logger = require('../logging/logger');
const package = require('../../package.json');
const session_tokens = require('../database/gateways/session-token-gateway');

const router = express.Router();
router.get('/', (req, res) => { handleEndpoint(req, res, handle); });

async function handle(req, res) {
	const activeUsers = await session_tokens.getActiveSessionTokenCount();
	const totalUsers = await employees.getRegisteredUserCount();

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		status: 'ALL ALMS SYSTEMS OPERATIONAL',
		stats: {
			activeUsers: activeUsers,
			totalUsers: totalUsers,
			uptime: process.uptime(),
			version: package.version,
		},
	});
}

module.exports = router; 