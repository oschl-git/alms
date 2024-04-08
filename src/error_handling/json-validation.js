/**
 * Module with various JSON checks
 */

function checkFieldsArePresent(...fields) {
	for (const field of fields) {
		console.log(field);
		if (field !== 0 && !field) {
			return false;
		}
	}
	return true;
}

function checkFieldsAreString(...fields) {
	for (const field of fields) {
		if (typeof field !== 'string') {
			return false;
		}
	}
	return true;
}

function checkFieldsAreInteger(...fields) {
	for (const field of fields) {
		if (!Number.isInteger(field)) {
			return false;
		}
	}
	return true;
}

function checkFieldsAreArray(...fields) {
	for (const field of fields) {
		if (!Array.isArray(field)) {
			return false;
		}
	}
	return true;
}

module.exports = {
	checkFieldsArePresent,
	checkFieldsAreString,
	checkFieldsAreInteger,
	checkFieldsAreArray,
};