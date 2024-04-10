/**
 * Middleware that handles requests with an invalid JSON.
 */

const logger = require('../logging/logger');

function badJsonErrorHandler(err, req, res, next) {
	if (res.headersSent || !err instanceof SyntaxError) {
		return next(err);
	}

	logger.warning(`${req.method} fail: Bad JSON submitted at ${req.originalUrl}. (${req.ip})`);
	res.status(400);
	res.json({
		error: 400,
		message: 'BAD JSON',
	});
}

module.exports = {
	badJsonErrorHandler,
};