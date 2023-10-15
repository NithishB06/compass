import { killChromeProcesses } from "./chrome/kill-chrome.js";
import { constants } from "./constants.js";
import { addHomePageInChrome } from "./chrome/add-homepage.js";
import { addStartupPageInChrome } from "./chrome/add-startup.js";
import { blockNotificationsInChrome } from "./chrome/block-notifications.js";
import { profiles } from "./util/generate-profile-list.js";
import { userInteraction } from "./util/user-interaction.js";
import { interactHomePagePosts } from "./facebook/interact-homepage-posts.js";
import { autoStreamVideos } from "./facebook/auto-stream.js";
import { delay } from "./util/add-delay.js";
import { setPersistentKey } from "./obs/set-persistent-key.js";
import { sendTelegramMessage } from "./telegram/send-message.js";

// KILLS ALL EXISTING CHROME PROCESSES
killChromeProcesses();

function chromeProfileSetup() {
	var chromeActionPromise = undefined;

	// EXECUTES ALL CHROME FUNCTIONALITIES
	if (constants.ADD_HOME_PAGE_IN_CHROME) {
		chromeActionPromise = addHomePageInChrome(
			profiles,
			constants.CUSTOM_WEB_ADDRESS_TO_ENTER
		);
	}

	if (constants.ADD_STARTUP_PAGE_IN_CHROME) {
		if (chromeActionPromise) {
			chromeActionPromise = chromeActionPromise.then(() => {
				return addStartupPageInChrome(
					profiles,
					constants.CUSTOM_WEB_ADDRESS_TO_ENTER
				);
			});
		}
	}

	if (constants.BLOCK_NOTIFICATIONS_IN_CHROME) {
		if (chromeActionPromise) {
			chromeActionPromise = chromeActionPromise.then(() => {
				return blockNotificationsInChrome(profiles);
			});
		}
	}

	chromeActionPromise.catch();
}

function interactWithFBPostsHomePage() {
	if (profiles) {
		interactHomePagePosts(profiles[0]).catch();
	} else {
		console.log(
			"[CONFIG]: No profile listed to interact with facebook posts in homepage"
		);
	}
}

async function facebookAutoStream() {
	try {
		var videoNumber = 1;

		await setPersistentKey(constants.PERSISTENT_KEY);

		sendTelegramMessage(
			`Initializing auto-stream for ${constants.NUMBER_OF_VIDEOS_IN_PLAYLIST} video(s)`
		);

		while (videoNumber <= constants.NUMBER_OF_VIDEOS_IN_PLAYLIST) {
			if (videoNumber != 1) {
				await delay(constants.INTERVAL_BETWEEN_STREAMS * 60);
			}

			console.log(`Video ${videoNumber} ready to be streamed`);

			killChromeProcesses();
			await autoStreamVideos(profiles[0]);

			videoNumber += 1;
		}
	} catch (err) {
		console.log(err);
	}
}

userInteraction().then((userInput) => {
	if (userInput == 1) {
		chromeProfileSetup();
	} else if (userInput == 2) {
		interactWithFBPostsHomePage();
	} else if (userInput == 3) {
		facebookAutoStream();
	}
});
