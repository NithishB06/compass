const readline = require("readline/promises");

async function userInteraction() {
	const prompt = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	var userInput;

	while (true) {
		console.log("=======================");
		console.log("Welcome to Compass!");
		console.log("=======================");

		console.log("1. Chrome Profile Setup");
		console.log("2. Interact with Facebook Posts [Homepage] ");

		userInput = await prompt.question("Please choose an action: ");
		if (userInput != 1 && userInput != 2) {
			console.clear();
		} else {
			prompt.close();
			break;
		}
	}

	return userInput;
}

module.exports = userInteraction;
