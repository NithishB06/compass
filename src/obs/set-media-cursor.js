import { obs, hostString } from './obs-ws-init.js';
import { constants } from '../constants.js';

export async function setMediaCursor(sourceName, mediaCursor) {
  await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

  await obs.call('SetMediaInputCursor', {
    inputName: sourceName,
    mediaCursor
  });

  await obs.disconnect();
}
