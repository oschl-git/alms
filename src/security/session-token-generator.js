/**
 * Handles generating session tokens.
 */

const crypto = require('crypto');

/**
 * Generates a new session token with a time signature.
 * @returns {string} the new session token
 */
function generateSessionToken() {
	const randomBytes = crypto.randomBytes(55).toString('hex');
	const timeSignature = getTimeSignature();

	return timeSignature + randomBytes;
}

function getTimeSignature() {
	let timeSignature = new Date().toISOString();

	timeSignature = timeSignature.replaceAll('-', '');
	timeSignature = timeSignature.replaceAll('T', '');
	timeSignature = timeSignature.replaceAll(':', '');
	timeSignature = timeSignature.replaceAll('.', '');

	return timeSignature;
}

module.exports = {
	generateSessionToken,
};