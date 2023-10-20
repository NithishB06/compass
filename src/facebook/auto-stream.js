import puppeteer from "puppeteer";
import { constants } from "../constants.js";
import { chromeArgs } from "../chrome/chrome-args.js";
import { readTextFile } from "../util/read-stream-titles.js";
import { delay } from "../util/add-delay.js";
import { getSourceId } from "../obs/get-source-id.js";
import { toggleThumbnailVisibility } from "../obs/toggle-thumbnail-visibility.js";
import { controlMedia } from "../obs/control-media.js";
import { controlAudio } from "../obs/control-audio.js";
import { fetchOBSStrikeStatus } from "../obs/obs-strike-stats.js";
import { moveNextVideo } from "../obs/move-next-video.js";
import { setStreamStatus } from "../obs/set-stream-status.js";
import { addMinutes } from "../util/add-minutes-to-date.js";
import clipboard from "clipboardy";
import { sendTelegramMessage } from "../telegram/send-message.js";
import { TimeoutError } from "puppeteer";
import {
	getDateString,
	getScreenshotSavePath,
} from "../util/screenshot-helper.js";

export async function autoStreamVideos(profile, pageData) {
	try {
		// OBS BASIC SETUP //
		var thumbnailSourceId = await getSourceId(
			constants.SCENE_NAME,
			constants.THUMBNAIL_SOURCE_NAME
		);

		var backupMediaSourceId = await getSourceId(
			constants.SCENE_NAME,
			constants.BACKUP_MEDIA_SOURCE_NAME
		);

		var mediaSourceId = await getSourceId(
			constants.SCENE_NAME,
			constants.MEDIA_SOURCE_NAME
		);

		await toggleThumbnailVisibility(
			constants.SCENE_NAME,
			thumbnailSourceId,
			true
		);

		await toggleThumbnailVisibility(
			constants.SCENE_NAME,
			backupMediaSourceId,
			false
		);

		await toggleThumbnailVisibility(constants.SCENE_NAME, mediaSourceId, true);

		await controlAudio(constants.MEDIA_SOURCE_NAME, "unmute");

		await controlAudio(constants.BACKUP_MEDIA_SOURCE_NAME, "mute");

		await controlMedia(constants.MEDIA_SOURCE_NAME, "pause");

		await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, "pause");

		// ----------------- //

		const browser = await puppeteer.launch({
			headless: false,
			executablePath: constants.CHROME_EXE_PATH,
			args: chromeArgs.slice(0).concat(`--profile-directory=${profile}`),
		});

		const page = (await browser.pages())[0];
		page.setDefaultTimeout(10000);

		// VISITS THE PAGE URL
		await page.goto(pageData.pageURL, {
			waitUntil: "networkidle0",
		});
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

			await page.waitForNavigation({
				waitUntil: "networkidle0",
			});
		}

		// CHECK PAGE NAME AND FOLLOWER COUNT BEFORE STREAM RUN

		const headings = await page.$$(constants.HEADING_SELECTOR);
		var headingTextContent;
		var pageName;

		for (let heading of headings) {
			headingTextContent = await heading.evaluate((el) => el.textContent);
			if (headingTextContent.toLowerCase() != constants.MANAGE_PAGE_TEXT) {
				pageName = headingTextContent;
				break;
			}
		}

		const likesAndFollowers = await page.$$(
			constants.LIKES_AND_FOLLOWERS_SELECTOR
		);

		const followerElement = likesAndFollowers.at(-1);
		const followerText = await followerElement.evaluate((el) => el.innerText);

		var followers = followerText.split(" ")[0];

		try {
			if (followers.includes("K") || followers.includes("M")) {
				await page.goto(constants.MOBILE_FACEBOOK_URL, {
					waitUntil: "networkidle0",
				});

				const mobileProfilePictureElement = (
					await page.$$(constants.MOBILE_IMAGE_SELECTORS)
				)[0];
				await mobileProfilePictureElement.click();

				await page.waitForSelector(
					constants.MOBILE_MAIN_FOLLOWER_COUNT_SELECTOR
				);

				const shortFollowerCountElement = (
					await page.$$(constants.MOBILE_MAIN_FOLLOWER_COUNT_SELECTOR)
				)[0];

				await shortFollowerCountElement.click();

				await page.waitForSelector(constants.MOBILE_FOLLOWER_COUNT);

				const followerCountElement = await page.$(
					constants.MOBILE_FOLLOWER_COUNT
				);
				followers = await followerCountElement.evaluate((el) => el.textContent);
				if (followers.includes(",")) {
					followers = followers.replace(",", "");
				}
			}
		} catch (error) {}

		// CHECK STRIKE COUNT BEFORE STREAM RUN
		var totalStrikes = 0;
		await page.goto(constants.PAGE_QUALITY_PAGE, {
			waitUntil: "networkidle0",
		});
		// await page.waitForNavigation();

		const pageQualitySpanSelectors = await page.$$(
			constants.PAGE_QUALITY_PAGE_SPAN_SELECTOR
		);
		for (let pageQualitySpanSelector of pageQualitySpanSelectors) {
			var spanInnerText = (
				await pageQualitySpanSelector.evaluate((el) => el.innerText)
			).toLowerCase();

			if (spanInnerText.includes(constants.STRIKE_IDENTIFIER_TEXT)) {
				totalStrikes += 1;
			}
		}

		const seeMoreSelector = (await page.$(constants.SEE_MORE_SELECTOR)) || null;

		if (seeMoreSelector) {
			var innerTextContent = await seeMoreSelector.evaluate(
				(el) => el.innerText
			);

			var additionalStrikeCount = Number(innerTextContent.split("(")[1][0]);
			totalStrikes += additionalStrikeCount;
		}

		console.log("Page Name: ", pageName);
		console.log("Total Followers: ", followers);
		console.log("Total Strikes: ", totalStrikes);

		await sendTelegramMessage(
			`Pre-stream stats:\nPage name: ${pageName}\nTotal followers: ${followers}\nTotal strikes: ${totalStrikes}`
		);

		// GO TO LIVE SETUP URL AND WAIT FOR FULL PAGE TO LOAD
		await page.goto(pageData.liveSetupURL, {
			waitUntil: "networkidle0",
		});
		// await page.waitForSelector(constants.SWITCH_SELECTOR);
		await page.waitForSelector(constants.LIVE_SETUP_GO_LIVE_BUTTON);

		var goLiveSetupButton = await page.$(constants.LIVE_SETUP_GO_LIVE_BUTTON);
		await goLiveSetupButton.click();

		// await page.waitForNavigation();
		try {
			await page.waitForSelector(constants.SWITCH_SELECTOR);
		} catch {
			await sendTelegramMessage(
				`${profile} post blocked, proceeding to exclude from the list of profiles`
			);
			return profile;
		}

		// CLOSE ALL POPUPS BY CLICKING ON CLOSE BUTTON
		var closeButtons = await page.$$(constants.CLOSE_BUTTON_SELECTOR);
		for (let closeButton of closeButtons) {
			await closeButton.click();
		}

		await delay(1);

		// FIND ALL BUTTONS AND LIST DOWN ADD A GROUP, AUDIENCE SETTINGS AND TITLE DESCRIPTION BUTTONS
		var buttons = await page.$$(constants.BUTTON_SELECTOR);
		var addGroupButton;
		var audienceSettingsButton;
		var titleDescriptionButton;
		var goLiveButton;

		for (let button of buttons) {
			var textContent = (
				await button.evaluate((el) => el.textContent)
			).toLowerCase();
			if (textContent == constants.ADD_A_GROUP_TO_PROMOTE_TEXT) {
				addGroupButton = button;
			} else if (textContent == constants.AUDIENCE_SETTINGS_TEXT) {
				audienceSettingsButton = button;
			} else if (textContent == constants.TITLE_DESCRIPTION_TEXT) {
				titleDescriptionButton = button;
			}
		}

		await delay(1);

		// CLICK ON ADD A GROUP BUTTON AND WAIT FOR FULL LOAD
		await addGroupButton.click();
		await page.waitForSelector(constants.REMOVE_BUTTON_SELECTOR);
		// await page.waitForNavigation();

		// SELECT GROUP TO PROMOTE AND CLOSE THE OPTION POPUP
		var radioButtons = await page.$$(constants.RADIO_BUTTON_SELECTOR);
		for (let radioButton of radioButtons) {
			textContent = await radioButton.evaluate((el) => el.textContent);

			if (textContent == constants.GROUP_NAME) {
				var radioButtonStatus = (
					await radioButton.evaluate((el) => el.ariaChecked)
				).toLowerCase();

				if (radioButtonStatus == constants.FALSE_KEYWORD) {
					await radioButton.click();
					(await page.$$(constants.CLOSE_BUTTON_SELECTOR)).at(-1).click();
					break;
				}
			}
		}

		// await page.waitForSelector(constants.SWITCH_SELECTOR);
		await page.waitForSelector(constants.REMOVE_BUTTON_SELECTOR, {
			visible: false,
		});

		await delay(1);

		// CLICK ON AUDIENCE SETTINGS AND WAIT FOR OPTION POPUP
		await audienceSettingsButton.click();
		await page.waitForSelector(constants.SAVE_BUTTON_SELECTOR);
		// await page.waitForNavigation();

		// CLICK ON AGE COMBOBOX OPTION AND SELECT PRESET AGE CATEGORY
		var audienceSettingComboboxSelector = await page.$(
			constants.AUDIENCE_SETTING_COMBOBOX_SELECTOR
		);

		await audienceSettingComboboxSelector.click();
		const audienceRestrictionOptions = await page.$$(constants.OPTION_SELECTOR);

		for (let audienceRestrictionOption of audienceRestrictionOptions) {
			var ageText = (
				await audienceRestrictionOption.evaluate((el) => el.innerText)
			).toLowerCase();

			if (ageText == constants.AUDIENCE_RESTRICTION) {
				await audienceRestrictionOption.click();
				(await page.$(constants.SAVE_BUTTON_SELECTOR)).click();
				break;
			}
		}

		// await page.waitForNavigation();
		await delay(2);
		// CLICK ON STREAMING SOFTWARE AND ACTIVATE PERSISTENT KEY
		(await page.$(constants.STREAMING_SOFTWARE_SELECTOR)).click();
		await page.waitForSelector(constants.STREAM_KEY_INPUT_SELECTOR);

		buttons = await page.$$(constants.BUTTON_SELECTOR);
		for (let button of buttons) {
			var buttonText = (
				await button.evaluate((el) => el.innerText)
			).toLowerCase();

			if (buttonText == constants.ADVANCED_SETTINGS_TEXT) {
				await button.click();
				await page.waitForSelector(constants.STREAM_SERVER_URL_SELECTOR);
				break;
			}
		}

		var switches = await page.$$(constants.SWITCH_SELECTOR);
		for (let Switch of switches) {
			var switchStatus = (
				await Switch.evaluate((el) => el.ariaChecked)
			).toLowerCase();

			var switchText = (
				await Switch.evaluate((el) => el.innerText)
			).toLowerCase();

			if (switchText.startsWith(constants.PERSISTENT_STREAM_KEY_TEXT)) {
				if (switchStatus == constants.FALSE_KEYWORD) {
					await Switch.click();
				}
				break;
			}
		}

		await delay(1);

		// ADD TO STORY
		var checkBox = await page.$(constants.CHECKBOX_SELECTOR);
		var checkBoxStatus = await checkBox.evaluate((el) => el.ariaChecked);
		if (checkBoxStatus == constants.FALSE_KEYWORD) {
			await checkBox.click();
		}

		await delay(1);

		// READ TITLE AND DESCRIPTION
		const title = readTextFile("title.txt");
		const description = readTextFile("description.txt");

		// ADD TITLE AND DESCRIPTION
		if (titleDescriptionButton) {
			await titleDescriptionButton.click();
			await page.waitForSelector(constants.SAVE_BUTTON_SELECTOR);

			const titleTextBox = (await page.$$(constants.TEXT_BOX_SELECTOR)).at(-1);
			await titleTextBox.click();
			clipboard.writeSync(title);
			await page.keyboard.down("ControlLeft");
			await page.keyboard.press("KeyV");

			const descriptionBox = await page.$(constants.DESCRIPTION_SELECTOR);
			await descriptionBox.click();
			clipboard.writeSync(description);
			await page.keyboard.down("ControlLeft");
			await page.keyboard.press("KeyV");

			const saveTitleDescription = await page.$(constants.SAVE_BUTTON_SELECTOR);
			await saveTitleDescription.click();
		} else {
			const titleTextBox = (
				await page.$$(constants.INPUT_LETTER_BOX_SELECTOR)
			).at(-1);

			await titleTextBox.click();
			clipboard.writeSync(title);
			await page.keyboard.down("ControlLeft");
			await page.keyboard.press("KeyV");

			const descriptionTextBox = await page.$(
				constants.DESCRIPTION_PLACEHOLDER_SELECTOR
			);
			await descriptionTextBox.click();
			clipboard.writeSync(description);
			await page.keyboard.down("ControlLeft");
			await page.keyboard.press("KeyV");
		}

		// START OBS ACTIONS
		await setStreamStatus("start");
		await delay(5);

		// CLICK ON GO LIVE BUTTON
		buttons = await page.$$(constants.BUTTON_SELECTOR);
		for (let button of buttons) {
			var innerText = (
				await button.evaluate((el) => el.innerText)
			).toLowerCase();

			if (innerText == constants.GO_LIVE_BUTTON_TEXT) {
				goLiveButton = button;
			}
		}

		const gamingPageCheckOne =
			(await page.$$(constants.GAMING_PAGE_CHECK_SELECTOR)) || null;
		const gamingPageCheckTwo =
			(await page.$$(constants.GAMING_PAGE_CHECK_SELECTOR_ALT)) || null;

		if (gamingPageCheckOne.length || gamingPageCheckTwo.length) {
			await goLiveButton.click();
			await page.waitForSelector(constants.TAG_A_GAME_SELECTOR);

			const goLiveConfirmation = (await page.$$(constants.GO_LIVE_SELECTOR)).at(
				-1
			);
			await goLiveConfirmation.click();
		} else {
			await goLiveButton.click();
		}

		var nowPlusXMinutes = addMinutes(new Date(), constants.LIVE_DURATION);
		var liveJustStarted = true;
		var videoDeleted = false;
		var viewCountSpan;
		var viewerCountRaw;
		var viewerCount;
		var conservativeMode = false;

		while (new Date() < nowPlusXMinutes) {
			if (liveJustStarted) {
				await delay(20);
				await toggleThumbnailVisibility(
					constants.SCENE_NAME,
					thumbnailSourceId,
					false
				);
				await delay(2);
				await controlMedia(constants.MEDIA_SOURCE_NAME, "play");
				liveJustStarted = false;
			}

			try {
				await page.waitForSelector(constants.LIVE_VIDEO_ENDED_SELECTOR, {
					timeout: 1000,
				});
				var deleteVideoAndReturn = (
					await page.$$(constants.QUICK_ACTIONS_SELECTOR)
				).at(-1);
				await deleteVideoAndReturn.click();
				await page.waitForSelector(constants.CONFIRM_BUTTON_SELECTOR);

				var confirmDeleteButton = (
					await page.$$(constants.CONFIRM_BUTTON_SELECTOR)
				).at(-1);
				await confirmDeleteButton.click();

				console.log("Video abruptly ended due to Strike");
				await sendTelegramMessage(
					"Video taken down due to strike, handled abrupt deletion"
				);
				videoDeleted = true;

				var obsStrikeStats = {};
				if (conservativeMode) {
					obsStrikeStats = await fetchOBSStrikeStatus(
						constants.BACKUP_MEDIA_SOURCE_NAME
					);
				} else {
					obsStrikeStats = await fetchOBSStrikeStatus(
						constants.MEDIA_SOURCE_NAME
					);
				}

				console.log("OBS Strike Stats: ", obsStrikeStats);
				await sendTelegramMessage(
					`OBS Strike Stats: \nCursor: ${obsStrikeStats.currentCursor}\nDuration: ${obsStrikeStats.totalDuration}\nImage path: ${obsStrikeStats.imagePath}`
				);

				// HANDLE OBS - FOR ABRUPT DELETION //
				await setStreamStatus("stop");
				await moveNextVideo(constants.MEDIA_SOURCE_NAME);
				await delay(1);
				await toggleThumbnailVisibility(
					constants.SCENE_NAME,
					thumbnailSourceId,
					true
				);

				await controlMedia(constants.MEDIA_SOURCE_NAME, "pause");
				await delay(5);

				console.log("Handled video abrupt deletion");

				if (conservativeMode) {
					console.log(
						`Stream met with strike even after running in conservative mode`
					);
					await sendTelegramMessage(
						`Stream met with strike even after running in conservative mode`
					);
				}

				await browser.close();
				return profile;

				// break;
			} catch (e) {
				if (e instanceof TimeoutError) {
					if (!conservativeMode) {
						viewCountSpan = (
							await page.$$(constants.SPAN_TAGS_DURING_LIVE_SELECTOR)
						)[4];
						viewerCountRaw = await viewCountSpan.evaluate(
							(el) => el.textContent
						);

						if (viewerCountRaw.includes(",")) {
							viewerCountRaw = viewerCountRaw.replace(",", "");
						}

						viewerCount = Number(viewerCountRaw);
						if (viewerCount > constants.VIEWER_COUNT_THRESHOLD) {
							await toggleThumbnailVisibility(
								constants.SCENE_NAME,
								backupMediaSourceId,
								true
							);

							await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, "play");

							await controlMedia(constants.MEDIA_SOURCE_NAME, "pause");

							conservativeMode = true;
						}
					}
				}
			}
		}

		if (!videoDeleted) {
			var endLiveVideoButton = await page.$(constants.END_LIVE_VIDEO_SELECTOR);
			await endLiveVideoButton.click();

			await page.waitForSelector(constants.CONFIRM_END_LIVE_VIDEO_SELECTOR);

			var endLiveVideoConfirmButton = await page.$(
				constants.CONFIRM_END_LIVE_VIDEO_SELECTOR
			);
			await endLiveVideoConfirmButton.click();

			await page.waitForSelector(constants.QUICK_ACTIONS_SELECTOR);

			deleteVideoAndReturn = (
				await page.$$(constants.QUICK_ACTIONS_SELECTOR)
			).at(-1);
			await deleteVideoAndReturn.click();

			await page.waitForSelector(constants.CONFIRM_BUTTON_SELECTOR);

			confirmDeleteButton = (
				await page.$$(constants.CONFIRM_BUTTON_SELECTOR)
			).at(-1);

			await confirmDeleteButton.click();

			console.log("Graceful delete successfully completed");
			await sendTelegramMessage("Video successfully streamed and deleted");

			// HANDLE OBS - FOR GRACEFUL DELETION //
			await setStreamStatus("stop");
			await moveNextVideo(constants.MEDIA_SOURCE_NAME);
			await delay(1);
			await toggleThumbnailVisibility(
				constants.SCENE_NAME,
				thumbnailSourceId,
				true
			);

			await controlMedia(constants.MEDIA_SOURCE_NAME, "pause");
			await delay(5);

			console.log("Handled graceful deletion");
		}

		if (conservativeMode) {
			console.log(
				`Successfully ran and deleted the video in Conservative Mode`
			);
			await sendTelegramMessage(
				`Successfully ran and deleted the video in Conservative Mode`
			);
		}

		await browser.close();
	} catch (error) {
		console.log(error);
		await sendTelegramMessage(`An error occured: ${error}`);
	}
}
