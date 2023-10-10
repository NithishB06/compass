var strftime = require("strftime");
var fs = require("fs");
const path = require("path");

var currentDateTime = new Date();

var currentDateTimeString = strftime("%Y-%m-%d_%H_%M_%S", currentDateTime);

function getScreenshotSavePath(component) {
	var dir = path.resolve(__dirname, `../../screenshots/${component}`);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	return dir;
}

module.exports = {
	currentDateTimeString,
	getScreenshotSavePath,
};
