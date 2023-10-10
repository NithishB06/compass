const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function getMediaState(sourceName) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	const mediaState = (
		await obs.call("GetMediaInputStatus", { inputName: sourceName })
	).mediaState;

	await obs.disconnect();

	return mediaState;
}

module.exports = getMediaState;
