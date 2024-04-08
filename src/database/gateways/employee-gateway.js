/**
 * Allows access to the employees database table
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');

async function getAllEmployees() {
	const result = await query('select id, username, name, surname, color from employees;');
	if (result.length <= 0) return [];

	let employees = [];
	for (const employee of result) {
		employees.push(mapResponseToLimitedObject(employee));
	}
	return employees;
}

async function getActiveEmployees() {
	const result = await query(
		'select employees.id, employees.username, employees.name, employees.surname, employees.color ' +
		'from session_tokens ' +
		'left join employees on session_tokens.id_employee = employees.id ' +
		'where datetime_expires>?;',
		new Date()
	);
	if (result.length <= 0) return [];

	let employees = [];
	for (const employee of result) {
		employees.push(mapResponseToLimitedObject(employee));
	}
	return employees;
}

async function addNewEmployee(username, name, surname, password, ip) {
	return await queryInsertReturnInsertedId(
		'insert into employees (username, name, surname, password, ip) ' +
		'values (?, ?, ?, ?, ?);',
		username, name, surname, password, ip,
	);
}

async function isUsernameTaken(username) {
	result = await query('select (id) from employees where binary username=?;', username);
	return result.length > 0;
}

async function getEmployeeObjectByUsername(username) {
	const result = await query('select * from employees where binary username=?;', username);
	if (result.length <= 0) return null;
	const employee = result[0];
	return mapResponseToObject(employee);
}

async function getEmployeeObjectBySessionToken(token) {
	const result = await query(
		'select employees.* ' +
		'from employees ' +
		'right join session_tokens on session_tokens.id_employee = employees.id ' +
		'where token=?;',
		token);
	if (result.length <= 0) return null;
	const employee = result[0];
	return mapResponseToObject(employee);
}

async function getEmployeeIdByUsername(username) {
	const result = await query('select * from employees where binary username=?;', username);
	if (result.length <= 0) return null;
	const employee = result[0];
	return employee.id;
}

async function getRegisteredUserCount() {
	const result = await query('select count(id) as count from employees;');
	return result[0].count;
}

async function getEmployeesInConversation(conversationId) {
	const result = await query(
		'select employees.* ' +
		'from conversation_participants ' +
		'left join employees on conversation_participants.id_employee = employees.id ' +
		'where id_conversation = ?;',
		conversationId);
	if (result.length <= 0) return [];

	let employees = [];
	for (const employee of result) {
		employees.push(mapResponseToObject(employee));
	}
	return employees;
}

async function setEmployeeColor(employeeId, colorId) {
	await query('update employees set color=? where id=?;', colorId, employeeId);
}

function mapResponseToObject(response) {
	return {
		id: response.id,
		username: response.username,
		name: response.name,
		surname: response.surname,
		password: response.password,
		ip: response.ip,
		color: response.color,
	};
}

function mapResponseToLimitedObject(response) {
	return {
		id: response.id,
		username: response.username,
		name: response.name,
		surname: response.surname,
		color: response.color,
	};
}

module.exports = {
	getAllEmployees,
	getActiveEmployees,
	addNewEmployee,
	isUsernameTaken,
	getEmployeeObjectByUsername,
	getEmployeeObjectBySessionToken,
	getEmployeeIdByUsername,
	getRegisteredUserCount,
	getEmployeesInConversation,
	setEmployeeColor,
};