const puppeteer = require("puppeteer");

const constants = require("../constants");
const { chromeArgs } = require("./chrome-args");

async function addHomePageInChrome(profiles, webAddress) {
	// LAUNCH BROWSER WITH SET CONFIGURATION
	for (let index in profiles) {
		const browser = await puppeteer.launch({
			headless: "new",
			executablePath: constants.CHROME_EXE_PATH,
			args: chromeArgs
				.slice(0)
				.concat(`--profile-directory=${profiles[index]}`),
		});

		const page = (await browser.pages())[0];

		// VISITS THE CHROME APPEARANCE PAGE
		await page.goto(constants.CHROME_APPEARANCE_URL);
		await page.setViewport({
			width: constants.CHROME_VIEW_PORT_WIDTH,
			height: constants.CHROME_VIEW_PORT_HEIGHT,
		});

		// SELECT SHOW HOME BUTTON ELEMENT
		const showHomeButtonElement = await page.evaluateHandle(
			constants.SHOW_HOME_BUTTON_ELEMENT
		);
		const showHomeButtonText = await showHomeButtonElement?.evaluate(
			(element) => element.textContent
		);

		// CHECK IF SHOW HOME BUTTON ELEMENT TEXT IS DISABLED AND CLICK ON THE BUTTON IF TRUE
		if (
			showHomeButtonText.toLowerCase().trim() ===
			constants.SHOW_HOME_BUTTON_DISABLED_TEXT
		) {
			const showHomeButtonClick = await page.evaluateHandle(
				constants.SHOW_HOME_BUTTON_TOGGLE_BUTTON
			);
			await showHomeButtonClick.click();
		}

		// FETCH INPUT BOX FOR ENTERING CUSTOM WEB ADDRESS
		const enterHomePageWebAddressField = await page.evaluateHandle(
			constants.ENTER_HOME_PAGE_WEB_ADDRESS_FIELD
		);

		// CLICK ON THE INPUT BOX AND SELECT EXISTING TEXT
		await enterHomePageWebAddressField.click();

		await page.keyboard.down("ControlLeft");
		await page.keyboard.press("KeyA");
		await page.keyboard.up("ControlLeft");

		// ENTER THE WEB ADDRESS AND HIT ENTER
		await page.keyboard.type(webAddress);
		await page.keyboard.press("Enter");

		// console.log(
		// 	`[COMPASS]: (${profile}) Successfully added ${webAddress} to Chrome home page`
		// );

		process.stdout.write(
			`[COMPASS]: Adding home page in chrome [${+index + 1}/${
				profiles.length
			}] completed`
		);
		process.stdout.cursorTo(0);

		await browser.close();
	}

	process.stdout.write("\n");
}

module.exports = addHomePageInChrome;
