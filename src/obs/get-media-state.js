import { obs, hostString } from './obs-ws-init.js';
import { constants } from '../constants.js';

export async function getMediaInputStatus(sourceName) {
  await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

  const mediaStatus = await obs.call('GetMediaInputStatus', {
    inputName: sourceName
  });

  await obs.disconnect();

  return mediaStatus;
}
