const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function getSourceIds(sceneName, sourceName) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);
	const response = await obs.call("GetSceneItemList", { sceneName });

	for (let sceneItem of response.sceneItems) {
		if (sceneItem.sourceName == sourceName) {
			await obs.disconnect();
			return sceneItem.sceneItemId;
		}
	}
}

module.exports = getSourceIds;
