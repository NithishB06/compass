import { obs, hostString } from "./obs-ws-init.js";
import { constants } from "../constants.js";

export async function getMediaState(sourceName) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	const mediaState = (
		await obs.call("GetMediaInputStatus", { inputName: sourceName })
	).mediaState;

	await obs.disconnect();

	return mediaState;
}
