/**
 * Allows access to the session_tokens database table
 */

const { generateSessionToken } = require('../../security/session-token-generator');
const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');
const dotenv = require('dotenv');

async function createAndReturnNewSessionToken(employeeId) {
	const token = generateSessionToken();

	beginTransaction();
	try {
		await clearTokenForEmployee(employeeId);
		await query(
			'insert into session_tokens (token, employee_id, datetime_created, datetime_expires) ' +
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
	result = await query('select (id) from session_tokens where employee_id=?;', employeeId);
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
		'delete from session_tokens where employee_id=?',
		employeeId,
	);
}

function getNewTokenExpiryDate() {
	dotenv.config();

	const validityLengthMinutes = process.env.TOKEN_VALID_FOR_MIN ?? 10;
	const validityLength = validityLengthMinutes * 60 * 1000;

	return new Date(Date.now() + validityLength);
}

async function isTokenActive(tokenString) {
	const result = await query('select datetime_expires from session_tokens where token=?;', tokenString);
	if (result.length <= 0) return null;
	const token = result[0];
	return new Date().getTime() < new Date(token.datetime_expires).getTime();
}

module.exports = {
	createAndReturnNewSessionToken,
	isTokenUnique,
	doesEmployeeHaveToken,
	refreshToken,
	clearTokenForEmployee,
	isTokenActive,
};