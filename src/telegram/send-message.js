import fetch from "node-fetch";
import { constants } from "../constants.js";

export async function sendTelegramMessage(message) {
	try {
		var encodedMessage = message.replaceAll(" ", "%20").replaceAll("\n", "%0A");
		var URL =
			constants.TELEGRAM_API +
			`/sendMessage?chat_id=${constants.TELEGRAM_CHAT_ID}&text=${encodedMessage}`;
		await fetch(URL);
	} catch (err) {
		console.log(err);
	}
}
