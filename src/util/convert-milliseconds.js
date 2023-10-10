function millisecondsToTimeStamp(milliseconds) {
	return new Date(milliseconds).toISOString().slice(11, 19);
}

module.exports = millisecondsToTimeStamp;
