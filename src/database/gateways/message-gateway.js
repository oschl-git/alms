/**
 * Allows access to the messages database table
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');

async function addNewMessage(employeeId, conversationId, content) {
	return await queryInsertReturnInsertedId(
		'insert into messages (id_employee, id_conversation, content, datetime_sent) values (?,?,?,?);',
		employeeId, conversationId, content, new Date()
	);
}

async function getMessagesFromConversation(conversationId, limit = 100) {
	const result = await query(
		'select m.id, e.username, e.name, e.surname, m.content, m.datetime_sent from messages m ' +
		'left join employees e on m.id_employee = e.id ' +
		'where id_conversation = ? ' +
		'order by datetime_sent desc ' +
		'limit ?;',
		conversationId, limit);
	if (result.length <= 0) return null;

	let messages = [];
	for (const message of result) {
		messages.push(mapResponseToObject(message));
	}
	return messages;
}

async function markMessageAsRead(employeeId, messageId) {
	await query(
		'insert ignore into read_messages (id_employee, id_message, datetime_read) ' +
		'values (?,?,?);',
		employeeId, messageId, new Date()
	);
}

async function markMessagesAsRead(employeeId, messages) {
	beginTransaction();

	try {
		for (const message of messages) {
			await markMessageAsRead(employeeId, message.id);
		}
	}
	catch (e) {
		rollback();
		throw e;
	}

	commit();
}

function mapResponseToObject(response) {
	return {
		id: response.id,
		username: response.username,
		name: response.name,
		surname: response.surname,
		content: response.content,
		datetimeSent: response.datetime_sent,
	};
}

module.exports = {
	addNewMessage,
	getMessagesFromConversation,
	markMessageAsRead,
	markMessagesAsRead,
};