import { configData } from "./util/read-config.js";

export const constants = {
	CHROME_KILL_COMMAND: "TASKKILL /f  /IM  CHROME.EXE",

	CHROME_EXE_PATH: String.raw`${configData.chromeExecutablePath}`,
	CHROME_USER_DATA_DIR: String.raw`${configData.chromeUserDataDir}`,
	CHROME_PROFILE_PATTERN: configData.profilePattern,
	CHROME_PROFILE_RANGES: configData.profileRanges,
	CHROME_PROFILES: configData.profiles,

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

	NUMBER_OF_POSTS_TO_COMMENT_IN_HOMEPAGE:
		configData.numberOfPostsToCommentInFBHomePage,

	FACEBOOK_POST_INTERACT_PAGE_URL: configData.autoCommentPageURL,
	FACEBOOK_HOME_URL: "https://fb.com",

	SWITCH_TO_PAGE_BUTTON: `div[aria-label='Switch' i][role='button' i]`,
	SEE_ALL_PROFILES_BUTTON: `div[aria-label='See all profiles' i][role='button' i]`,

	HOME_PAGE_PICTURE: `img.x1ey2m1c.xds687c.x5yr21d.x10l6tqk.x17qophe.x13vifvy.xh8yej3.xl1xv1r`,
	LIKE_BUTTON: `div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x5ve5x3`,
	COMMENT_SEND_BUTTON: `div[aria-label='Comment' i][role='button' i]`,
	LEAVE_A_COMMENT_BUTTON: `div[aria-label='Leave a comment' i][role='button' i]`,
	CLOSE_BUTTON: `div[aria-label='Close' i][role='button' i]`,

	OBS_WEBSOCKET_HOST: configData.OBSWebsocketHost,
	OBS_WEBSOCKET_PORT: configData.OBSWebsocketPort,
	OBS_WEBSOCKET_PASSWORD: configData.OBSWebsocketPassword,

	PERSISTENT_KEY: configData.persistentKey,

	SCENE_NAME: configData.sceneName,
	THUMBNAIL_SOURCE_NAME: configData.thumbnailSourceName,
	MEDIA_SOURCE_NAME: configData.mediaSourceName,
	BGM_SOURCE_NAME: configData.bgmSourceName,

	LIVE_DURATION: configData.liveDuration,
	NUMBER_OF_VIDEOS_IN_PLAYLIST: configData.numberOfVideosInPlaylist,
	INTERVAL_BETWEEN_STREAMS: configData.intervalBetweenStreams,

	LIVE_SETUP_PAGE_URL: configData.liveSetupPageURL,
	LIVE_SETUP_URL: configData.liveSetupURL,
	LIVE_SETUP_GO_LIVE_BUTTON: `div[aria-label='Go live' i][role='button' i]`,
	LIKES_AND_FOLLOWERS_SELECTOR: `a.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.xt0b8zv.xi81zsa.x1s688f`,
	SWITCH_SELECTOR: `div[role='switch' i]`,
	BUTTON_SELECTOR: `div[role='button' i]`,
	REMOVE_BUTTON_SELECTOR: `div[aria-label='Remove' i][role='button' i]`,
	RADIO_BUTTON_SELECTOR: `div[role='radio' i]`,
	CLOSE_BUTTON_SELECTOR: `div[aria-label='Close' i][role='button' i]`,
	SAVE_BUTTON_SELECTOR: `div[aria-label='Save' i][role='button' i]`,
	AUDIENCE_SETTING_COMBOBOX_SELECTOR: `label[aria-expanded='false' i][role='combobox' i][aria-label='Age' i]`,
	OPTION_SELECTOR: `div[role='option' i]`,
	STREAMING_SOFTWARE_SELECTOR: `div[aria-label='Streaming software' i][role='radio' i]`,
	STREAM_KEY_INPUT_SELECTOR: `input[aria-label='Stream key' i]`,
	STREAM_SERVER_URL_SELECTOR: `input[value='rtmps://live-api-s.facebook.com:443/rtmp/']`,
	CHECKBOX_SELECTOR: `div[role='checkbox' i]`,
	TEXT_BOX_SELECTOR: `input[type='text' i]`,
	DESCRIPTION_SELECTOR: `div[aria-label='Description (required)' i][role='textbox' i]`,
	INPUT_LETTER_BOX_SELECTOR: `input[dir='ltr' i][type='text' i]`,
	DESCRIPTION_PLACEHOLDER_SELECTOR: `div[aria-describedby^='placeholder-' i]`,
	PAGE_QUALITY_PAGE_SPAN_SELECTOR: `span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xk50ysn.xzsf02u.x1yc453h`,
	SEE_MORE_SELECTOR: `div[aria-label^='see more' i][role='button' i]`,
	GAMING_PAGE_CHECK_SELECTOR: `input[aria-label='Tag a game (ex: Fortnite)' i]`,
	GAMING_PAGE_CHECK_SELECTOR_ALT: `input[aria-label='Tag a game (e.g. Fortnite)' i]`,
	TAG_A_GAME_SELECTOR: `div[aria-label='Tag game' i][role='button' i]`,
	GO_LIVE_SELECTOR: `div[aria-label='Go live' i][role='button' i]`,
	LIVE_VIDEO_ENDED_SELECTOR: `div[aria-label='Live Video Ended' i][role='button' i][aria-disabled='true' i]`,
	QUICK_ACTIONS_SELECTOR: `div.x78zum5.xdt5ytf.xq8finb.x1e56ztr.x1n2onr6.x14vqqas.xqcrz7y`,
	CONFIRM_BUTTON_SELECTOR: `div[aria-label='Confirm' i][role='button' i]`,

	ADD_A_GROUP_TO_PROMOTE_TEXT: "add a group to promote",
	AUDIENCE_SETTINGS_TEXT: "audience settings",
	TITLE_DESCRIPTION_TEXT: "what's your live video about?",
	FALSE_KEYWORD: "false",
	ADVANCED_SETTINGS_TEXT: "advanced settings",
	PERSISTENT_STREAM_KEY_TEXT: "persistent stream key",
	GO_LIVE_BUTTON_TEXT: "go live",
	STRIKE_IDENTIFIER_TEXT: "piece of content",
	DELETE_AND_RETURN_TEXT: [
		"delete video and return to page",
		"delete video & return to page",
		"delete video & return to news feed",
	],

	GROUP_NAME: configData.groupName,
	AUDIENCE_RESTRICTION: configData.audienceRestriction,

	PAGE_QUALITY_PAGE: `https://www.facebook.com/settings?tab=profile_quality`,
};
