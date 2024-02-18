/**
 * Handles the index (/) endpoint
 */

const express = require('express');
const package = require('../../package.json');

const router = express.Router();

router.get('/', async function (req, res) {
	res.status(200);
	res.json({
		status: 'All ALMS systems operational.',
		stats: {
			uptime: process.uptime(),
			version: package.version,
			activeUsers: 0,
			totalUsers: 0,
		},
	});
});

module.exports = router; 