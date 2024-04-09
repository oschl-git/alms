/**
 * Handles authenticating employees with session tokens
 */

const employees = require('../database/gateways/employee-gateway');
const sessionTokens = require('../database/gateways/session-token-gateway');

const Results = {
	TOKEN_EXPIRED: 'TOKEN_EXPIRED',
	TOKEN_BAD: 'TOKEN_BAD',
	TOKEN_MISSING: 'TOKEN_MISSING',
};

/**
 * Evaluates requests with authentication, refreshes tokens
 * @param {any} req - Express request 
 * @returns Result if authentication fails, user object if it succeeds
 */
async function authenticate(req) {
	const token = req.headers.token;

	if (!token) {
		return Results.TOKEN_MISSING;
	}

	const isTokenActive = await sessionTokens.isTokenActive(token);

	if (isTokenActive === null) {
		return Results.TOKEN_BAD;
	}

	if (!isTokenActive) {
		return Results.TOKEN_EXPIRED;
	}

	await sessionTokens.refreshToken(token);

	return employees.getEmployeeObjectBySessionToken(token);
}

module.exports = {
	Results,
	authenticate,
};