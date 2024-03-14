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
 * @return {int} - Id of the created conversation
 */
async function createNewConversationWithEmployees(name, usernames) {
	const isGroup = usernames.length > 2;

	beginTransaction();

	let conversationId = null;
	try {
		conversationId = await createNewConversation(name, isGroup);
		for (const username of usernames) {
			await addNewConversationEmployeeRelation(conversationId, username);
		}
	}
	catch (e) {
		rollback();
		throw e;
	}

	commit();

	return conversationId;
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

async function getConversationById(id) {
	const result = await query('select * from conversations where id=?;', id);
	if (result.length <= 0) return null;
	const conversation = result[0];
	return mapResponseToObject(conversation);
}

async function getAllConversationsForEmployee(employeeId, onlyGroup = false) {
	let query = (
		'select conversations.id, name, is_group, datetime_created ' +
		'from conversation_participants ' +
		'left join conversations on conversation_participants.id_conversation = conversations.id ' +
		'where id_employee = ?'
	);
	if (onlyGroup) {
		query += ' and is_group = 1';
	}
	query += ';';

	const result = await query(query, employeeId);

	let conversations = [];
	for (const conversation of result) {
		conversations.push(mapResponseToObject(conversation));
	}
	return conversations;
}

async function getConversationBetweenTwoEmployees(username1, username2) {
	const result = await query(
		'select c.id, c.name, c.is_group, c.datetime_created ' +
		'from conversations c ' +
		'join conversation_participants cp1 on c.id = cp1.id_conversation ' +
		'join conversation_participants cp2 on c.id = cp2.id_conversation ' +
		'join employees e1 on cp1.id_employee = e1.id ' +
		'join employees e2 on cp2.id_employee = e2.id ' +
		'where e1.username = ? ' +
		'and e2.username = ?;',
		username1, username2
	);

	if (result.length <= 0) return null;
	return mapResponseToObject(result[0]);
}

async function getAllConversationsWithParticipantsForEmployee(employeeId, onlyGroup = false) {
	let conversationArray = await getAllConversationsForEmployee(employeeId, onlyGroup);

	for (let conversation of conversationArray) {
		const participants = await employees.getEmployeesInConversation(conversation.id);

		conversation.participants = [];
		for (const participant of participants) {
			conversation.participants.push({
				id: participant.id,
				username: participant.username,
				name: participant.name,
				surname: participant.surname,
			});
		}
	}

	return conversationArray;
}

function mapResponseToObject(response) {
	return {
		id: response.id,
		name: response.name,
		isGroup: response.is_group,
		datetimeCreated: response.datetime_created,
	};
}

module.exports = {
	createNewConversationWithEmployees,
	createNewConversation,
	addNewConversationEmployeeRelation,
	getConversationById,
	getAllConversationsForEmployee,
	getAllConversationsWithParticipantsForEmployee,
	getConversationBetweenTwoEmployees,
};