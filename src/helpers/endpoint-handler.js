/**
 * Handles endpoints and sends an error response if something goes wrong.
 */

const authenticator = require('../security/authenticator');
const logger = require('../logging/logger');

async function handleEndpoint(req, res, handler, requireAuth) {
	try {
		let employee;
		if (requireAuth) {
			let authResult = await authenticator.authenticate(req);

			switch (authResult) {
				case authenticator.Results.TOKEN_MISSING:
					res.status(401);
					res.json({
						error: 401,
						message: 'UNAUTHORIZED',
					});
					logger.warning(
						`${req.method} AUTH fail: Authentication token missing at ${req.originalUrl}. (${req.ip})`
					);
					return;

				case authenticator.Results.TOKEN_BAD:
					res.status(401);
					res.json({
						error: 401,
						message: 'AUTH TOKEN BAD',
					});
					logger.warning(
						`${req.method} AUTH fail: Client supplied bad token at ${req.originalUrl}. (${req.ip})`
					);
					return;

				case authenticator.Results.TOKEN_EXPIRED:
					res.status(401);
					res.json({
						error: 401,
						message: 'AUTH TOKEN EXPIRED',
					});
					logger.warning(
						`${req.method} AUTH fail: Client supplied expired token at ${req.originalUrl}. (${req.ip})`
					);
					return;

				default:
					employee = authResult;
					break;
			}
		}

		await handler(req, res, employee);
	}
	catch (e) {
		res.status(500);
		res.json({
			error: 500,
			message: 'INTERNAL ALMS ERROR',
		});
		logger.error(
			`${req.method} error: Internal ALMS error at ${req.originalUrl}. (${req.ip})\n${e}`
		);
	}
}

module.exports = {
	handleEndpoint,
};