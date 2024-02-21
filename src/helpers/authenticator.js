const employees = require('../database/gateways/employee-gateway');
const sessionTokens = require('../database/gateways/session-token-gateway');
const logger = require('../logging/logger');

const Results = {
	TOKEN_EXPIRED: 'TOKEN_EXPIRED',
	BAD_TOKEN: 'BAD_TOKEN',
	TOKEN_MISSING: 'TOKEN_MISSING',
};

async function authenticate(req, res) {
	const token = req.body.token;

	if (!token) {
		res.status(401);
		res.json({
			error: 401,
			message: 'ASAP TOKEN MISSING',
		});
		logger.warning(`${req.method} fail: Authentication token missing at ${req.path}. (${req.ip})`);
		return Results.TOKEN_MISSING;
	}

	const isTokenActive = await sessionTokens.isTokenActive(token);

	if (isTokenActive === null) {
		res.status(401);
		res.json({
			error: 401,
			message: 'BAD TOKEN',
		});
		logger.warning(`${req.method} fail: User supplied bad token at ${req.path}. (${req.ip})`);
		return Results.BAD_TOKEN;
	}

	if (!isTokenActive) {
		res.status(401);
		res.json({
			error: 401,
			message: 'TOKEN EXPIRED',
		});
		logger.warning(`${req.method} fail: User supplied expired token at ${req.path}. (${req.ip})`);
		return Results.TOKEN_EXPIRED;
	}

	return employees.getEmployeeObjectBySessionToken(token);
}

module.exports = {
	Results,
	authenticate,
};