/**
 * Allows access to the session_tokens database table
 */

const { generateSessionToken } = require('../../helpers/session-token-generator');
const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');
const dotenv = require('dotenv');

async function createNewSessionToken(employeeId) {
	const token = generateSessionToken();

	return await queryInsertReturnInsertedId(
		'insert into session_tokens (token, employee_id, datetime_created, datetime_expires) ' +
		'values (?, ?, ?, ?);',
		token, employeeId, new Date(), getNewTokenExpiryDate(),
	);
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

module.exports = {
	createNewSessionToken,
	isTokenUnique,
	doesEmployeeHaveToken,
	refreshToken,
	clearTokenForEmployee,
};