const { badJsonErrorHandler } = require('./error_handling/bad-json');
const { rateLimit } = require('express-rate-limit');
const { tooManyRequestsResponse } = require('./error_handling/too-many-requests');
const bodyParser = require('body-parser');
const connection = require('./database/connection');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const https = require('https');
const loader = require('require-dir');
const logger = require('./logging/logger');

async function main() {
	logger.success('Startup initiated.');

	// load .env configuration
	dotenv.config();

	// check if log folder is configured
	if (process.env.LOG_FOLDER) {
		logger.success('Log folder appears to be correctly configured.');
	}
	else {
		logger.warning('No log folder specified, logs will not be stored.');
	}

	// check if database is connected
	try {
		await connection.runTestQuery();
		logger.success('Database appears to be correctly configured and operational.');
	}
	catch (e) {
		logger.error('Error connecting to database. Startup cannot continue.');
		return;
	}

	// configure Express application
	const app = express();
	const port = process.env.PORT || 5678;

	// set up JSON parsing
	app.use(bodyParser.json({
		limit: '10mb',
	}));
	app.use(badJsonErrorHandler);

	// set up rate limiting
	const limiter = rateLimit({
		windowMs: 1 * 60 * 1000,
		max: process.env.MAX_REQUESTS_PER_MINUTE ?? 250,
		standardHeaders: true,
		legacyHeaders: false,
		message: tooManyRequestsResponse,
	});
	app.use(limiter);

	// dynamically load endpoints from the endpoints folder
	const endpoints = loader('./endpoints');
	for (const endpoint in endpoints) {
		const path = endpoint != 'index' ? endpoint : '';
		app.use('/' + path, endpoints[endpoint]);
	}

	// favicon endpoint
	app.get('/favicon.ico', function (req, res) {
		logger.success(`${req.method} OK: Client requested favicon: ${req.originalUrl}. (${req.ip})`);
		res.status(200);
		res.sendFile(__dirname + '/img/favicon.png');
	});

	// 404 error endpoint
	app.all('*', function (req, res) {
		logger.warning(`${req.method} error: Client requested an invalid endpoint: ${req.originalUrl}. (${req.ip})`);
		res.status(404);
		res.json({
			error: 404,
			message: 'ENDPOINT INVALID',
		});
	});

	// start Express application
	if (process.env.USE_HTTPS === 'true') {
		const key = process.env.HTTPS_KEY;
		const cert = process.env.HTTPS_CERT;

		if (key == null || cert == null) {
			logger.error('Attempted to use HTTPS but no key or certificate was specified.');
			return;
		}

		const server = https.createServer({
			key: fs.readFileSync(key),
			cert: fs.readFileSync(cert),
		}, app);

		server.listen(port, () => {
			logger.success(
				`The Aperture Laboratories Messaging Service is now running on HTTPS at port ${port} and available ` +
				`to all qualified Aperture Science personnel.`
			);
		});
	}
	else {
		app.listen(port, () => {
			logger.success(
				`The Aperture Laboratories Messaging Service is now running on HTTP at port ${port} and available to ` +
				`all qualified Aperture Science personnel.`
			);
		});
	}
}

main();