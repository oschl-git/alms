function checkAllFieldsAreString(...fields) {
	for (const field of fields) {
		if (typeof field !== 'string') {
			return false;
		}
	}
	return true;
}

module.exports = {
	checkAllFieldsAreString,
};