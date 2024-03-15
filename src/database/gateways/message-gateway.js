/**
 * Allows access to the messages database table
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');

async function addNewMessage(employeeId, conversationId, content) {
	return await queryInsertReturnInsertedId(
		'insert into messages (id_employee, id_conversation, content) values (?,?,?);',
		employeeId, conversationId, content
	);
}

module.exports = {
	addNewMessage,
};