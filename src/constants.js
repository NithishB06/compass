const configData = require("./util/read-config");

module.exports = Object.freeze({
	CHROME_KILL_COMMAND: "TASKKILL /f  /IM  CHROME.EXE",

	CHROME_EXE_PATH: String.raw`${configData.chromeExecutablePath}`,
	CHROME_USER_DATA_DIR: String.raw`${configData.chromeUserDataDir}`,
	CHROME_PROFILE_PATTERN: configData.profilePattern,
	CHROME_PROFILE_RANGES: configData.profileRanges,
	CHROME_PROFILES: configData.profiles,

	CHROME_PROFILE_DIRECTORY: "HENG_3Idiots051",
	CHROME_VIEW_PORT_WIDTH: 1920,
	CHROME_VIEW_PORT_HEIGHT: 1080,

	CHROME_APPEARANCE_URL: "chrome://settings/appearance",
	CHROME_STARTUP_URL: "chrome://settings/onStartup",
	CHROME_NOTIFICATIONS_URL: "chrome://settings/content/notifications",

	SHOW_HOME_BUTTON_DISABLED_TEXT: "disabled",
	SHOW_HOME_BUTTON_ELEMENT: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(16) > settings-appearance-page").shadowRoot.querySelector("#pages > div > settings-toggle-button:nth-child(4)").shadowRoot.querySelector("#sub-label-text")`,
	SHOW_HOME_BUTTON_TOGGLE_BUTTON: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(16) > settings-appearance-page").shadowRoot.querySelector("#pages > div > settings-toggle-button:nth-child(4)").shadowRoot.querySelector("#control")`,
	ENTER_HOME_PAGE_WEB_ADDRESS_FIELD: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(16) > settings-appearance-page").shadowRoot.querySelector("#customHomePage").shadowRoot.querySelector("#input").shadowRoot.querySelector("#input")`,

	OPEN_SPECIFIC_PAGE_RADIO_BUTTON: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(21) > settings-on-startup-page").shadowRoot.querySelector("#onStartupRadioGroup > controlled-radio-button:nth-child(4)").shadowRoot.querySelector("#button")`,
	ADD_A_NEW_PAGE_LINK: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(21) > settings-on-startup-page").shadowRoot.querySelector("settings-startup-urls-page").shadowRoot.querySelector("#addPage > a")`,
	ADD_A_NEW_PAGE_POPUP_INPUT_BOX: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section:nth-child(21) > settings-on-startup-page").shadowRoot.querySelector("settings-startup-urls-page").shadowRoot.querySelector("settings-startup-url-dialog").shadowRoot.querySelector("#url").shadowRoot.querySelector("#input")`,

	DONT_ALLOW_SITES_TO_SEND_NOTIFICATIONS_RADIO: `document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section.expanded > settings-privacy-page").shadowRoot.querySelector("#notificationRadioGroup > settings-radio-group > settings-collapse-radio-button:nth-child(4)").shadowRoot.querySelector("#button")`,

	CUSTOM_WEB_ADDRESS_TO_ENTER: "https://fb.com",

	ADD_HOME_PAGE_IN_CHROME: configData.addHomePageInChrome,
	ADD_STARTUP_PAGE_IN_CHROME: configData.addStartupPageInChrome,
	BLOCK_NOTIFICATIONS_IN_CHROME: configData.blockNotificationsInChrome,
});
