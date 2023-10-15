import { obs, hostString } from "./obs-ws-init.js";
import { constants } from "../constants.js";
import { millisecondsToTimeStamp } from "../util/convert-milliseconds.js";
import {
	getDateString,
	getScreenshotSavePath,
} from "../util/screenshot-helper.js";

export async function fetchOBSStrikeStatus(sourceName) {
	await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

	const { mediaCursor, mediaDuration } = await obs.call("GetMediaInputStatus", {
		inputName: sourceName,
	});

	const directoryPath = getScreenshotSavePath("obs");

	var currentDateTimeString = getDateString();

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
