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
import path from "path";
import { fileURLToPath } from "url";
import { countFilesInDirectory } from "./util/get-file-count.js";

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
		var profileIndex = 0;
		var streamProfiles = profiles.slice(0);

		await setPersistentKey(constants.PERSISTENT_KEY);

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const pathToDirectory = path.resolve(
			__dirname,
			`../${constants.STREAM_FOLDER_NAME}/`
		);

		const numberOfVideosInFolder = await countFilesInDirectory(pathToDirectory);

		await sendTelegramMessage(
			`Auto Stream Initializing:\nNumber of video(s): ${numberOfVideosInFolder}\nStream duration: ${constants.LIVE_DURATION} min(s)\nInterval between streams: ${constants.INTERVAL_BETWEEN_STREAMS} min(s)\nNumber of admins: ${profiles.length}`
		);

		while (videoNumber <= numberOfVideosInFolder) {
			if (videoNumber != 1) {
				await delay(constants.INTERVAL_BETWEEN_STREAMS * 60);
			}

			console.log(
				`[${streamProfiles[profileIndex]}] - Video ${videoNumber} ready to be streamed`
			);
			await sendTelegramMessage(
				`[${streamProfiles[profileIndex]}] - Video ${videoNumber} ready to be streamed`
			);

			killChromeProcesses();
			var profileReturn = await autoStreamVideos(streamProfiles[profileIndex]);

			if (profileReturn) {
				streamProfiles.splice(streamProfiles.indexOf(profileReturn), 1);
				console.log(`Removed ${profileReturn} from list of streaming profiles`);
				await sendTelegramMessage(
					`Removed ${profileReturn} from list of streaming profiles`
				);
			}

			profileIndex += 1;
			if (profileIndex >= streamProfiles.length) {
				profileIndex = 0;
			}

			videoNumber += 1;

			if (!streamProfiles.length) {
				console.log("All profiles exhausted, quitting auto-stream");
				await sendTelegramMessage(
					"All admin profiles exhausted, terminating auto stream"
				);
				return "";
			}
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
