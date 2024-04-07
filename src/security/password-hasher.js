/**
 * Handles password hashing and verification
 */

const crypto = require('crypto');

/**
 * Hashes a password and returns the hash combined with salt.
 * @param {string} password - The password to hash 
 * @returns {string} the hashed password
 */
function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 64).toString('hex');

	return salt + hash;
}

/**
 * Checks whether a plaintext and hashed passwords match.
 * @param {string} password - The password submitted by user, plain text 
 * @param {string} storedPassword - Stored hashed password
 * @returns {boolean} whether passwords match
 */
function doPasswordsMatch(password, storedPassword) {
	const salt = storedPassword.substring(0, 32);
	const storedHash = storedPassword.substring(32, 160);

	const newHash = crypto.scryptSync(password, salt, 64).toString('hex');

	return storedHash == newHash;
}

module.exports = {
	hashPassword,
	doPasswordsMatch,
};