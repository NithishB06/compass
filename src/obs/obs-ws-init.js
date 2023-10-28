import OBSWebSocket from 'obs-websocket-js';
import { constants } from '../constants.js';

export const obs = new OBSWebSocket();

export const hostString = `ws://${constants.OBS_WEBSOCKET_HOST}:${constants.OBS_WEBSOCKET_PORT}`;
