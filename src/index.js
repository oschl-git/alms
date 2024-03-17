const { badJsonErrorHandler } = require('./error_handling/bad-json');
const { rateLimit } = require('express-rate-limit');
const bodyParser = require('body-parser');
const connection = require('./database/connection');
const dotenv = require('dotenv');
const express = require('express');
const loader = require('require-dir');
const logger = require('./logging/logger');
const { tooManyRequestsResponse } = require('./error_handling/too-many-requests');

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
	const port = process.env.PORT || 3000;
	// app.set('trust proxy', true);

	// set up JSON parsing
	app.use(bodyParser.json({
		limit: '10mb',
	}));
	app.use(badJsonErrorHandler);

	// set up rate limiting
	const limiter = rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 100,
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
	app.listen(port, () => {
		logger.success(
			`The Aperture Laboratories Messaging Service is now running at port ${port} and available to all ` +
			`qualified Aperture Science personnel.`
		);
	});
}

main();