/**
 * Handles generating session tokens
 */

const crypto = require('crypto');

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