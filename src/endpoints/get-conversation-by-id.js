/**
 * Handles the /get-conversation-by-id endpoint
 */

const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const logger = require('../logging/logger');
const authenticator = require('../security/authenticator');

const router = express.Router();

router.get('/:id', async function (req, res) {
	const employee = await authenticator.authenticate(req, res);
	if (typeof employee !== 'object') {
		return;
	};

	const id = req.params.id;

	if (! await conversations.doesEmployeeHaveAccess(employee.id, id)) {
		res.status(400);
		res.json({
			error: 400,
			message: 'CONVERSATION NOT FOUND',
		});
		logger.warning(
			`${req.method} fail: Attempted to get nonexistent conversation at ${req.originalUrl}. (${req.ip})`
		);
		return;
	}

	logger.success(`${req.method} OK: ${req.originalUrl} (${req.ip})`);
	res.status(200);
	res.json(await conversations.getConversationWithParticipantsById(id));
});

module.exports = router; 