import puppeteer from "puppeteer";

import { constants } from "../constants.js";
import { chromeArgs } from "./chrome-args.js";

export async function blockNotificationsInChrome(profiles) {
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
		await page.goto(constants.CHROME_NOTIFICATIONS_URL);
		await page.setViewport({
			width: constants.CHROME_VIEW_PORT_WIDTH,
			height: constants.CHROME_VIEW_PORT_HEIGHT,
		});

		// SELECT DONT ALLOW SITES TO SEND NOTIFICATIONS RADIO BUTTON
		const blockSiteNotificationsRadioButton = await page.evaluateHandle(
			constants.DONT_ALLOW_SITES_TO_SEND_NOTIFICATIONS_RADIO
		);
		await blockSiteNotificationsRadioButton.click();

		process.stdout.write(
			`[COMPASS]: Blocking notifications in chrome [${+index + 1}/${
				profiles.length
			}] completed`
		);
		process.stdout.cursorTo(0);

		await browser.close();
	}

	process.stdout.write("\n");
}
