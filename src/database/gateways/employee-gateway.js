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
	result = await query('select (id) from employees where username=?;', username);
	return result.length > 0;
}

async function getEmployeeObjectByUsername(username) {
	const result = await query('select * from employees where username=?;', username);
	if (result.length <= 0) return null;
	const employee = result[0];
	return {
		id: employee.id,
		username: employee.username,
		name: employee.name,
		surname: employee.surname,
		password: employee.password,
		ip: employee.ip,
	};
}

module.exports = {
	addNewEmployee,
	isUsernameTaken,
	getEmployeeObjectByUsername,
};