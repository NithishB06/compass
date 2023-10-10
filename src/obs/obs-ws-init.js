const OBSWebSocket = require("obs-websocket-js").default;
const constants = require("../constants");

const obs = new OBSWebSocket();

const hostString = `ws://${constants.OBS_WEBSOCKET_HOST}:${constants.OBS_WEBSOCKET_PORT}`;

module.exports = { obs, hostString };
