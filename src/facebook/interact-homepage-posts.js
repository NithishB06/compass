import puppeteer from "puppeteer";

import { constants } from "../constants.js";
import { chromeArgs } from "../chrome/chrome-args.js";
import { pickRandomPhrase } from "../util/randomize-phrases.js";
import {
	getDateString,
	getScreenshotSavePath,
} from "../util/screenshot-helper.js";
import { delay } from "../util/add-delay.js";

export async function interactHomePagePosts(profile) {
	try {
		const browser = await puppeteer.launch({
			headless: "new",
			executablePath: constants.CHROME_EXE_PATH,
			args: chromeArgs.slice(0).concat(`--profile-directory=${profile}`),
		});

		const page = (await browser.pages())[0];

		// VISITS THE PAGE URL
		await page.goto(constants.FACEBOOK_POST_INTERACT_PAGE_URL);
		await page.setViewport({
			width: constants.CHROME_VIEW_PORT_WIDTH,
			height: constants.CHROME_VIEW_PORT_HEIGHT,
		});

		// CHECK IF THE PAGE HAS SWITCH BUTTON - TO IDENTIFY IF CURRENT LOGIN IS USER OR PAGE
		const pageSwitchButton =
			(await page.$(constants.SWITCH_TO_PAGE_BUTTON)) || null;

		// IF USER IS LOGGED IN THEN SWITCH TO PAGE AND GO BACK TO HOME PAGE
		if (pageSwitchButton) {
			await pageSwitchButton.click();

			await page.waitForSelector(constants.SEE_ALL_PROFILES_BUTTON);

			const switchConfirmButton = await page.evaluateHandle(
				`document.querySelector("${constants.SEE_ALL_PROFILES_BUTTON}").parentNode.parentNode.childNodes[0].childNodes[0]`
			);

			await switchConfirmButton.click();

			await page.waitForNavigation();
		}

		// GO TO FACEBOOK HOMEPAGE AND WAIT FOR PICTURE
		await page.goto(constants.FACEBOOK_HOME_URL);
		await page.waitForSelector(constants.HOME_PAGE_PICTURE);

		var successCommentCount = 0;
		var count = 0;

		// LOOP TO INTERACT WITH PICTURES
		while (
			successCommentCount < constants.NUMBER_OF_POSTS_TO_COMMENT_IN_HOMEPAGE
		) {
			try {
				// WAIT FOR FIRST PICTURE IN FACEBOOK HOMEPAGE
				var homepagePostImage = await page.$$(constants.HOME_PAGE_PICTURE);

				// RECORD NUMBER OF LIKE BUTTONS BEFORE CLICKING
				var likeButtonsBeforeClick = await page.$$(constants.LIKE_BUTTON);
				var likeButtonLengthBeforeClick = likeButtonsBeforeClick.length;

				// CLICK ON PICTURE AND MAXIMIZE IT
				homepagePostImage[count].click();

				var likeButtonLengthAfterClick = likeButtonLengthBeforeClick;

				// RECORD NUMBER OF LIKE BUTTONS AFTER CLICK TO IDENTIFY THE CORRECT LIKE BUTTON TO CLICK
				while (likeButtonLengthAfterClick <= likeButtonLengthBeforeClick) {
					await page.waitForSelector(constants.COMMENT_SEND_BUTTON);
					var likeButtonsAfterClick = await page.$$(constants.LIKE_BUTTON);
					likeButtonLengthAfterClick = likeButtonsAfterClick.length;
				}

				await delay(2);

				await likeButtonsAfterClick.at(-1).click();

				// SCREENSHOT EVERY POST
				var currentDateTimeString = getDateString();
				await page.screenshot({
					path: `${getScreenshotSavePath(
						"facebook"
					)}\\${currentDateTimeString}.png`,
				});

				// PICK RANDOMIZED PHRASE TO COMMENT
				var randomPhrase = await pickRandomPhrase("");

				const commentButtons = await page.$$(constants.LEAVE_A_COMMENT_BUTTON);

				await delay(2);

				// CLICK ON COMMENT BUTTON TO FOCUS ON THE COMMENT SECTION, THEN ENTER THE RANDOM PHRASE AND PRESS ENTER
				try {
					await commentButtons.at(-1).click();
				} catch {
					console.log("Panic");
					count += 1;
					const panicCloseButton = await page.$$(constants.CLOSE_BUTTON);
					await panicCloseButton[0].click();
					continue;
				}

				await page.keyboard.type(randomPhrase);
				await page.keyboard.press("Enter");

				// CLOSE THE MAXIMIZED POST
				const closeButton = await page.$$(constants.CLOSE_BUTTON);
				await closeButton[0].click();

				successCommentCount += 1;
				count += 1;

				process.stdout.write(
					`[COMPASS]: Interacting with Facebook posts in homepage [${+successCommentCount}/${
						constants.NUMBER_OF_POSTS_TO_COMMENT_IN_HOMEPAGE
					}] completed`
				);

				process.stdout.cursorTo(0);
			} catch {
				var currentDateTimeString = getDateString();

				await page.screenshot({
					path: `${getScreenshotSavePath(
						"facebook"
					)}\\${currentDateTimeString}.png`,
				});

				count += 1;
			}
		}

		await browser.close();

		process.stdout.write("\n");
	} catch {}
}
