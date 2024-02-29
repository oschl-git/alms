/**
 * Response if user requests too many requests.
 */

const logger = require('../logging/logger');

async function tooManyRequestsResponse(req, res) {
	logger.warning(`${req.method} fail: Too many requests from ${req.ip}.`);
	res.status(429);
	res.json({
		error: 429,
		message: 'TOO MANY REQUESTS',
	});
};

module.exports = {
	tooManyRequestsResponse,
};