/**
 * Module with various JSON checks
 */

function checkFieldsArePresent(...fields) {
	for (const field of fields) {
		if (!field) {
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
	checkFieldsAreArray,
};