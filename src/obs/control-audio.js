const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");
const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function controlAudio(sourceName, action) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	var mute = false;

	if (action == "mute") {
		mute = true;
	}

	await obs.call("SetInputMute", {
		inputName: sourceName,
		inputMuted: mute,
	});

	await obs.disconnect();
}

module.exports = controlAudio;
