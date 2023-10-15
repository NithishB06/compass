import { obs, hostString } from "./obs-ws-init.js";
import { constants } from "../constants.js";

export async function controlAudio(sourceName, action) {
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
