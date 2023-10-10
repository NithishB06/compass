const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function setPersistentKey(persistentKey) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	try {
		await obs.call("StopStream");
	} catch {}

	while (true) {
		if (!(await obs.call("GetStreamStatus")).outputActive) {
			break;
		}
	}
	const streamSettings = {
		streamServiceType: "rtmp_common",
		streamServiceSettings: {
			key: persistentKey,
		},
	};

	await obs.call("SetStreamServiceSettings", streamSettings);

	await obs.disconnect();
}

module.exports = setPersistentKey;
