const express = require('express');
const logger = require('./logging/logger');
const dotenv = require('dotenv');
const loader = require('require-dir');
const connection = require('./database/connection');

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
		logger.error(`Error connecting to database.`);
		return;
	}

	// configure Express application
	const app = express();
	const port = process.env.PORT || 3000;

	// dynamically load routes from the routes folder
	const routes = loader('./routes');
	for (const route in routes) {
		const path = route != 'homepage' ? route : '';
		app.use('/' + path, routes[route]);
	}

	// start Express application
	app.listen(port, () => {
		logger.success(
			`The Aperture Laboratories Messaging Service is running at port ${port} and available to select Aperture ` +
			`Science personnel. (http://localhost:${port})`
		);
	});
}

main();