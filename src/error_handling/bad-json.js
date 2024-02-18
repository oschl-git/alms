function badJsonErrorHandler(err, req, res, next) {
	if (!err instanceof SyntaxError) return;

	if (res.headersSent) {
		return next(err);
	}
	res.status(500);
	res.json({
		error: 400,
		message: 'Bad JSON.',
	});
}

module.exports = {
	badJsonErrorHandler,
};