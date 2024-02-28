/**
 * Allows access to the employees database table
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');

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
		'select employees.id, employees.username, employees.name, ' +
		'employees.surname, employees.password, employees.ip ' +
		'from employees ' +
		'right join session_tokens on session_tokens.employee_id = employees.id ' +
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

function mapResponseToObject(response) {
	return {
		id: response.id,
		username: response.username,
		name: response.name,
		surname: response.surname,
		password: response.password,
		ip: response.ip,
	};
}

module.exports = {
	addNewEmployee,
	isUsernameTaken,
	getEmployeeObjectByUsername,
	getEmployeeObjectBySessionToken,
	getEmployeeIdByUsername,
	getRegisteredUserCount,
};