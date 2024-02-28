/**
 * Handles the index (/) endpoint
 */

const express = require('express');
const logger = require('../logging/logger');
const package = require('../../package.json');

const router = express.Router();

router.get('/', async function (req, res) {
	// TODO: Make the following two not 0 :)
	const activeUsers = 0;
	const totalUsers = 0;

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json({
		status: 'All ALMS systems operational.',
		stats: {
			uptime: process.uptime(),
			version: package.version,
			activeUsers: activeUsers,
			totalUsers: totalUsers,
		},
	});
});

module.exports = router; 