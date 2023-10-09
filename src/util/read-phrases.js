const { promises: fsPromises } = require("fs");

async function readPhrases(filename) {
	const fileContents = await fsPromises.readFile(filename, "utf-8");

	const fileContentArray = fileContents.split(/\r?\n/);

	return fileContentArray;
}

module.exports = readPhrases;
