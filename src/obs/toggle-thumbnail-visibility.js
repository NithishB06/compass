const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function toggleThumbnailVisibility(sceneName, sceneItemId, visible) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	await obs.call("SetSceneItemEnabled", {
		sceneName,
		sceneItemId,
		sceneItemEnabled: visible,
	});

	await obs.disconnect();
}

module.exports = toggleThumbnailVisibility;
