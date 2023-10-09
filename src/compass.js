const killChromeProcesses = require("./chrome/kill-chrome");
const constants = require("./constants");
const addHomePageInChrome = require("./chrome/add-homepage");
const addStartupPageInChrome = require("./chrome/add-startup");
const blockNotificationsInChrome = require("./chrome/block-notifications");
const profiles = require("./util/generate-profile-list");
const userInteraction = require("./util/user-interaction");
const interactHomePagePosts = require("./facebook/interact-homepage-posts");

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

	chromeActionPromise.catch((err) => {
		console.log("Error: ", err);
	});
}

function interactWithFBPostsHomePage() {
	if (profiles) {
		interactHomePagePosts(profiles[0]).catch((err) => {
			console.log("Error: ", err);
		});
	} else {
		console.log(
			"[CONFIG]: No profile listed to interact with facebook posts in homepage"
		);
	}
}

userInteraction().then((userInput) => {
	if (userInput == 1) {
		chromeProfileSetup();
	} else if (userInput == 2) {
		interactWithFBPostsHomePage();
	}
});
