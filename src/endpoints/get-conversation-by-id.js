/**
 * Handles the /get-conversation-by-id endpoint
 */

const { handleEndpoint } = require('../helpers/endpoint-handler');
const conversations = require('../database/gateways/conversation-gateway');
const express = require('express');
const logger = require('../logging/logger');

const router = express.Router();
router.get('/:id', (req, res) => { handleEndpoint(req, res, handle, true); });

async function handle(req, res, employee) {
	const id = req.params.id;

	if (! await conversations.doesEmployeeHaveAccess(employee.id, id)) {
		res.status(404);
		res.json({
			error: 404,
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
}

module.exports = router; 