import { readPhrases } from "./read-phrases.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIRST_PHRASES_FILE = path.resolve(__dirname, "../../first_phrases.txt");
const SECOND_PHRASES_FILE = path.resolve(__dirname, "../../second_phrases.txt");
const THIRD_PHRASES_FILE = path.resolve(__dirname, "../../third_phrases.txt");

export async function pickRandomPhrase(randomString) {
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
