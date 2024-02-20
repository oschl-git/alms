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

module.exports = {
	checkFieldsArePresent,
	checkFieldsAreString,
};