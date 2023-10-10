const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function controlMedia(sourceName, action) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	var mediaAction = "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY";

	if (action == "pause") {
		mediaAction = "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE";
	}

	await obs.call("TriggerMediaInputAction", {
		inputName: sourceName,
		mediaAction,
	});

	await obs.disconnect();
}

module.exports = controlMedia;
