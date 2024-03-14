/**
 * Allows access to the session_tokens database table
 */

const { generateSessionToken } = require('../../security/session-token-generator');
const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');
const dotenv = require('dotenv');

/**
 * Runs a transaction that clears any existing tokens for the employee and then creates a new one. The new token is
 * returned.
 * @param {int} employeeId - ID of the employee
 * @returns {string} the session token
 */
async function createAndReturnNewSessionToken(employeeId) {
	const token = generateSessionToken();

	beginTransaction();
	try {
		await clearTokenForEmployee(employeeId);
		await query(
			'insert into session_tokens (token, id_employee, datetime_created, datetime_expires) ' +
			'values (?, ?, ?, ?);',
			token, employeeId, new Date(), getNewTokenExpiryDate(),
		);
	} catch (e) {
		rollback();
		throw e;
	}
	commit();

	return token;
}

async function isTokenUnique(token) {
	result = await query('select (id) from session_tokens where token=?;', token);
	return result.length > 0;
}

async function doesEmployeeHaveToken(employeeId) {
	result = await query('select (id) from session_tokens where id_employee=?;', employeeId);
	return result.length > 0;
}

async function refreshToken(token) {
	await query(
		'update session_tokens set datetime_expires=? where token=?',
		getNewTokenExpiryDate(), token,
	);
}

async function clearTokenForEmployee(employeeId) {
	await query(
		'delete from session_tokens where id_employee=?',
		employeeId,
	);
}

async function isTokenActive(tokenString) {
	const result = await query('select datetime_expires from session_tokens where token=?;', tokenString);
	if (result.length <= 0) return null;
	const token = result[0];
	return new Date().getTime() < new Date(token.datetime_expires).getTime();
}

async function getActiveSessionTokenCount() {
	const result = await query('select count(id) as count from session_tokens where datetime_expires>?;', new Date());
	return result[0].count;
}

function getNewTokenExpiryDate() {
	dotenv.config();

	const validityLengthMinutes = process.env.TOKEN_VALID_FOR_MIN ?? 10;
	const validityLength = validityLengthMinutes * 60 * 1000;

	return new Date(Date.now() + validityLength);
}

module.exports = {
	createAndReturnNewSessionToken,
	isTokenUnique,
	doesEmployeeHaveToken,
	refreshToken,
	clearTokenForEmployee,
	isTokenActive,
	getActiveSessionTokenCount,
};