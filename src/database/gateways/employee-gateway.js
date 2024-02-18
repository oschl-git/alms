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

module.exports = {
	addNewEmployee,
	isUsernameTaken,
};