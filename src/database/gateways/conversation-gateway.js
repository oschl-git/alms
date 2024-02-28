/**
 * Allows access to the conversations and conversation-participants database tables
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');
const employees = require('../gateways/employee-gateway');

/**
 * Runs a transaction that creates a new conversation in the conversations table and then adds employees to it in the
 * conversation-participants table.
 * @param {string} name - Name for the conversation
 * @param {string[]} usernames - Array of usernames of participants
 */
async function createNewConversationWithEmployees(name, usernames) {
	const isGroup = usernames.length > 2;

	beginTransaction();

	try {
		const conversationId = await createNewConversation(name, isGroup);
		for (const username of usernames) {
			await addNewConversationEmployeeRelation(conversationId, username);
		}
	}
	catch (e) {
		rollback();
		throw e;
	}

	commit();
}

async function createNewConversation(name, isGroup) {
	return await queryInsertReturnInsertedId(
		'insert into conversations (name, is_group, datetime_created) values (?,?,?);',
		name, isGroup, new Date(),
	);
}

async function addNewConversationEmployeeRelation(conversationId, employeeUsername) {
	const employeeId = await employees.getEmployeeIdByUsername(employeeUsername);
	await query(
		'insert into conversation_participants (id_conversation, id_employee) values (?,?);',
		conversationId, employeeId,
	);
}

async function doesConversationExist(name) {
	result = await query('select (id) from conversations where binary name=?;', name);
	return result.length > 0;
}

module.exports = {
	createNewConversationWithEmployees,
	createNewConversation,
	addNewConversationEmployeeRelation,
	doesConversationExist,
};