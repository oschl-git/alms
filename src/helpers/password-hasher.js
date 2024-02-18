const crypto = require('crypto');

function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 64).toString('hex');

	return salt + hash;
}

function isPasswordValid(password, storedPassword) {
	const salt = storedPassword.substring(0, 32);
	const storedHash = storedPassword.substring(32, 160);

	const newHash = crypto.scryptSync(password, salt, 64).toString('hex');

	return storedHash == newHash;
}

module.exports = {
	hashPassword,
	isPasswordValid,
};