const connection = require('./database/connection');
const dotenv = require('dotenv');
const express = require('express');
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

	// check if database is successfully connected
	try {
		await connection.runTestQuery();
		logger.success('Database appears to be correctly configured and functional.');
	} catch (e) {
		logger.error(`Error connecting to database. Startup cannot continue.`);
		return;
	}

	// configure Express application
	const app = express();
	const port = process.env.PORT || 3000;

	// dynamically load endpoints from the endpoints folder
	const endpoints = loader('./endpoints');
	for (const endpoint in endpoints) {
		const path = endpoint != 'index' ? endpoint : '';
		app.use('/' + path, endpoints[endpoint]);
	}

	// 404 error endpoint
	app.get('*', function (req, res) {
		res.status(404);
		res.json({
			error: 404,
			message: 'Invalid endpoint.',
		});
	});

	// start Express application
	app.listen(port, () => {
		logger.success(
			`The Aperture Laboratories Messaging Service is now running at port ${port} and available to all ` +
			`qualified Science personnel.`
		);
	});
}

main();