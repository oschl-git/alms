/**
 * Allows access to the conversations and conversation-participants database tables
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');
const employees = require('../gateways/employee-gateway');

async function createNewConversationWithUsers(name, users) {
	beginTransaction();

	try {
		const conversationId = await createNewConversation(name);
		for (const username of users) {
			await addNewConversationEmployeeRelation(conversationId, username);
		}
	}
	catch (e) {
		rollback();
		throw e;
	}
	commit();
}

async function createNewConversation(name) {
	return await queryInsertReturnInsertedId(
		'insert into conversations(name, datetime_created) values (?,?);',
		name, new Date(),
	);
}

async function addNewConversationEmployeeRelation(conversationId, employeeUsername) {
	const employeeId = employees.getEmployeeIdByUsername(employeeUsername);
	await query(
		'insert into conversation_participants (id_conversation, id_employee) values (?, ?);',
		conversationId, employeeId,
	);
}