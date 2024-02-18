/**
 * Handles the /register endpoint
 */

const express = require('express');
const package = require('../../package.json');

const router = express.Router();

router.post('/', async function (req, res) {
	res.status(200);
	console.log(req.body);
});

module.exports = router; 