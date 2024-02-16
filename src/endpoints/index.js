/**
 * Handles the index endpoint.
 */

const express = require('express');

const router = express.Router();

router.get('/', async function (req, res) {
	res.status(200);
	res.json({
		status: 'All ALMS systems operational.',
		uptime: process.uptime(),
	});
});

module.exports = router; 