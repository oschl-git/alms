/**
 * Handles authenticating employees with session tokens
 */

const employees = require('../database/gateways/employee-gateway');
const sessionTokens = require('../database/gateways/session-token-gateway');
const logger = require('../logging/logger');

const Results = {
	TOKEN_EXPIRED: 'TOKEN_EXPIRED',
	BAD_TOKEN: 'BAD_TOKEN',
	TOKEN_MISSING: 'TOKEN_MISSING',
};

/**
 * Handles authenticating requests. Sends error response to the client if authentication fails and returns the
 * appropriate Result. If authentication succeeds, returns the user object.
 * @param {any} req - Express request 
 * @param {any} res - Express response
 * @returns Result if authentication fails, user object if it succeeds
 */
async function authenticate(req, res) {
	const token = req.headers.token;

	if (!token) {
		res.status(401);
		res.json({
			error: 401,
			message: 'ASAP TOKEN MISSING',
		});
		logger.warning(`${req.method} AUTH fail: Authentication token missing at ${req.originalUrl}. (${req.ip})`);
		return Results.TOKEN_MISSING;
	}

	const isTokenActive = await sessionTokens.isTokenActive(token);

	if (isTokenActive === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'BAD ASAP TOKEN',
		});
		logger.warning(`${req.method} AUTH fail: Client supplied bad token at ${req.originalUrl}. (${req.ip})`);
		return Results.BAD_TOKEN;
	}

	if (!isTokenActive) {
		res.status(401);
		res.json({
			error: 401,
			message: 'ASAP TOKEN EXPIRED',
		});
		logger.warning(`${req.method} AUTH fail: Client supplied expired token at ${req.originalUrl}. (${req.ip})`);
		return Results.TOKEN_EXPIRED;
	}

	return employees.getEmployeeObjectBySessionToken(token);
}

module.exports = {
	Results,
	authenticate,
};