const logger = require('../logging/logger');

function badJsonErrorHandler(err, req, res, next) {
	if (res.headersSent || !err instanceof SyntaxError) {
		return next(err);
	}

	logger.warning(`${req.method} fail: Bad JSON submitted at ${req.originalUrl}. (${req.ip})`);
	res.status(500);
	res.json({
		error: 400,
		message: 'Bad JSON.',
	});
}

module.exports = {
	badJsonErrorHandler,
};