/**
 * Allows access to the employees database table
 */

const { query, queryInsertReturnInsertedId, beginTransaction, commit, rollback } = require('../connection');

async function addNewEmployee(username, name, surname, password) {
	return await queryInsertReturnInsertedId(
		'insert into doctors (username, name, surname, password) ' +
		'values (?, ?, ?, ?);',
		username, name, surname, password
	);
}