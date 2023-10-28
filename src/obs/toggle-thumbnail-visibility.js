import { obs, hostString } from './obs-ws-init.js';
import { constants } from '../constants.js';

export async function toggleThumbnailVisibility(
  sceneName,
  sceneItemId,
  visible
) {
  await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);

  await obs.call('SetSceneItemEnabled', {
    sceneName,
    sceneItemId,
    sceneItemEnabled: visible
  });

  await obs.disconnect();
}
