/**
 * Handles encrypting and decrypting messages
 */

const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();
const secretKey = process.env.ENCRYPTION_KEY;

/**
 * 
 * @param {string} text - The text to encrypt
 * @returns {string} the encrypted text with initialization vector
 */
function encrypt(text) {
	console.log(secretKey);
	const iv = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

	let encrypted = cipher.update(text, 'utf-8', 'hex');
	encrypted += cipher.final('hex');

	return iv.toString('base64') + encrypted;
}

/**
 * 
 * @param {string} text - The text to decrypt
 * @returns {string} the decrypted message
 */
function decrypt(text) {
	let iv = Buffer.from(text.substring(0, 24), 'base64');
	let message = text.substring(24);

	const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

	let decrypted = decipher.update(message, 'hex', 'utf-8');
	decrypted += decipher.final('utf-8');

	return decrypted;
}

module.exports = {
	encrypt,
	decrypt,
};