/**
 * Handles writing text to files and logging.
 */

const fs = require('fs');

function writeLogMessageToFile(message, filepath) {
	fs.appendFileSync(filepath, `${getCurrentDateTimeString()} ${message}\n`, (err) => {
		if (err) {
			throw err;
		}
	});
}

function getCurrentDateTimeString() {
	dateTime = new Date().toISOString();
	dateTime = dateTime.slice(0, 19);
	dateTime = dateTime.replace('T', ' ');

	return dateTime;
}

module.exports = {
	writeLogMessageToFile,
};