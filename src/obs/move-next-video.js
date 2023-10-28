import { obs, hostString } from './obs-ws-init.js';
import { constants } from '../constants.js';

export async function moveNextVideo(sourceName) {
  await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

  await obs.call('TriggerMediaInputAction', {
    inputName: sourceName,
    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT'
  });

  await obs.disconnect();
}
