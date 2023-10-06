const killChromeProcesses = require("./chrome/kill-chrome");
const constants = require("./constants");
const addHomePageInChrome = require("./chrome/add-homepage");
const addStartupPageInChrome = require("./chrome/add-startup");
const blockNotificationsInChrome = require("./chrome/block-notifications");
const profiles = require("./util/generate-profile-list");

// KILLS ALL EXISTING CHROME PROCESSES
killChromeProcesses();

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
	console.log("Unexpected Error: ", err);
});
