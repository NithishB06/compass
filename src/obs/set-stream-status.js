const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");

async function setStreamStatus(action) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	if (action == "start") {
		try {
			await obs.call("StartStream");
		} catch {}
	} else {
		try {
			await obs.call("StopStream");
		} catch {}
	}

	await obs.disconnect();
}

module.exports = setStreamStatus;
