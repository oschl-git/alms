/**
 * Handles encrypting and decrypting messages.
 */

const crypto = require('crypto');
const dotenv = require('dotenv');
const logger = require('../logging/logger');

dotenv.config();
const secretKey = process.env.ENCRYPTION_KEY;

/**
 * Encrypts a string and returns the cipher.
 * @param {string} text - The text to encrypt
 * @returns {string} the encrypted text with initialization vector
 */
function encrypt(text) {
	const iv = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

	let encrypted = cipher.update(text, 'utf-8', 'hex');
	encrypted += cipher.final('hex');

	return iv.toString('base64') + encrypted;
}

/**
 * Decrypt a cipher and returns the decrypted string.
 * @param {string} text - The text to decrypt
 * @returns {string} the decrypted message if decryption was successful, the original text if not
 */
function decrypt(text) {
	try {
		let iv = Buffer.from(text.substring(0, 24), 'base64');
		let message = text.substring(24);

		const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

		let decrypted = decipher.update(message, 'hex', 'utf-8');
		decrypted += decipher.final('utf-8');

		return decrypted;
	} catch (e) {
		logger.error(
			'Failed decrypting a message. It appears that there is an incorrectly stored (possibly unencrypted) ' +
			'message in the database.'
		);

		return text;
	}
}

/**
 * Decrypts the content of a message object.
 * @param {object} message - The message object to decrypt
 * @returns {object} message content with decrypted content
 */
function decryptMessageObject(message) {
	let decryptedMessage = { ...message };
	decryptedMessage.content = decrypt(message.content);
	return decryptedMessage;
}

/**
 * Decrypts the contents of message objects in an array.
 * @param {object[]} array - The array of objects to decrypt 
 * @returns {object[]} an array of messages with their content decrypted
 */
function decryptMessageObjectArray(array) {
	let outputArray = [];
	for (const message of array) {
		outputArray.push(decryptMessageObject(message));
	}
	return outputArray;
}


module.exports = {
	encrypt,
	decrypt,
	decryptMessageObject,
	decryptMessageObjectArray,
};