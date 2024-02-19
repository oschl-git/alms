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

async function getStoredPassword(username) {
	let result = await query('select (password) from employees where username=?;', username);
	if (result.length <= 0) return null;
	return result[0].password;
}

module.exports = {
	addNewEmployee,
	isUsernameTaken,
	getStoredPassword,
};