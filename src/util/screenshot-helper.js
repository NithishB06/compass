import fs from "fs";
import path from "path";
import strftime from "strftime";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDateString() {
	var currentDateTime = new Date();

	var currentDateTimeString = strftime("%Y-%m-%d_%H_%M_%S", currentDateTime);

	return currentDateTimeString;
}

export function getScreenshotSavePath(component) {
	var dir = path.resolve(__dirname, `../../screenshots/${component}`);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	return dir;
}
