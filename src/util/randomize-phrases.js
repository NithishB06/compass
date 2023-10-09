const readPhrases = require("./read-phrases");
const path = require("path");

const FIRST_PHRASES_FILE = path.resolve(__dirname, "../../first_phrases.txt");
const SECOND_PHRASES_FILE = path.resolve(__dirname, "../../second_phrases.txt");
const THIRD_PHRASES_FILE = path.resolve(__dirname, "../../third_phrases.txt");

async function pickRandomPhrase(randomString) {
	return readPhrases(FIRST_PHRASES_FILE)
		.then((array) => {
			randomString += String(array[Math.floor(Math.random() * array.length)]);
			return readPhrases(SECOND_PHRASES_FILE);
		})
		.then((array) => {
			randomString +=
				" " + String(array[Math.floor(Math.random() * array.length)]);
			return readPhrases(THIRD_PHRASES_FILE);
		})
		.then((array) => {
			return (randomString +=
				" " + String(array[Math.floor(Math.random() * array.length)]));
		});
}

module.exports = pickRandomPhrase;
