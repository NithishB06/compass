const { obs, hostString } = require("./obs-ws-init");
const constants = require("../constants");
const millisecondsToTimeStamp = require("../util/convert-milliseconds");
const {
	currentDateTimeString,
	getScreenshotSavePath,
} = require("../util/screenshot-helper");

async function fetchOBSStrikeStatus(sourceName) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	const { mediaCursor, mediaDuration } = await obs.call("GetMediaInputStatus", {
		inputName: sourceName,
	});

	const directoryPath = getScreenshotSavePath("obs");

	const imageFilePath = `${directoryPath}\\${currentDateTimeString}.png`;

	await obs.call("SaveSourceScreenshot", {
		sourceName,
		imageFormat: "png",
		imageFilePath,
		imageWidth: 1280,
		imageHeight: 720,
		imageCompressionQuality: 0,
	});

	await obs.disconnect();

	return {
		currentCursor: millisecondsToTimeStamp(mediaCursor),
		totalDuration: millisecondsToTimeStamp(mediaDuration),
		imagePath: imageFilePath,
	};
}

module.exports = fetchOBSStrikeStatus;
