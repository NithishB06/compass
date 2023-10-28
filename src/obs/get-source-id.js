import { obs, hostString } from './obs-ws-init.js';
import { constants } from '../constants.js';

export async function getSourceId(sceneName, sourceName) {
  await obs.connect(hostString, constants.OBS_WEBSOCKET_PASSWORD);
  const response = await obs.call('GetSceneItemList', { sceneName });

  for (let sceneItem of response.sceneItems) {
    if (sceneItem.sourceName == sourceName) {
      await obs.disconnect();
      return sceneItem.sceneItemId;
    }
  }
}
