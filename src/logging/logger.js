/**
 * Handles logging.
 */

const dotenv = require('dotenv');
const path = require('path');

const { writeLogMessageToFile } = require('../helpers/text-file-handler');

dotenv.config();

/**
 * Logs a message of type success.
 * @param {string} message 
 */
function success(message) {
	content = getFormattedLogMessage(message);
	console.info(content);
	log(content);
}

/**
 * Logs a message of type warning.
 * @param {string} message 
 */
function warning(message) {
	content = getFormattedLogMessage(message, 'WARNING');
	console.warn(content);
	log(content);
}

/**
 * Logs a message of type error.
 * @param {string} message 
 */
function error(message) {
	content = getFormattedLogMessage(message, 'ERROR');
	console.error(content);
	log(content);
}

function log(message) {
	if (!process.env.LOG_FOLDER) {
		return;
	}

	const date = new Date().toISOString().slice(0, 10);
	const filePath = path.join(process.env.LOG_FOLDER, `${date}.txt`);

	try {
		writeLogMessageToFile(message, filePath);
	}
	catch (e) {
		console.error(`ALMS<ERROR> Attempted to write to log but failed. ${e}`);
	}
}

function getFormattedLogMessage(message, type = null) {
	const prefix = type != null ? `<${type}>` : '>';
	return `ALMS${prefix} ${message}`;
}

module.exports = {
	success,
	warning,
	error,
};