import { killChromeProcesses } from './chrome/kill-chrome.js';
import { constants } from './constants.js';
import { addHomePageInChrome } from './chrome/add-homepage.js';
import { addStartupPageInChrome } from './chrome/add-startup.js';
import { blockNotificationsInChrome } from './chrome/block-notifications.js';
import { profiles } from './util/generate-profile-list.js';
import { userInteraction } from './util/user-interaction.js';
import { interactHomePagePosts } from './facebook/interact-homepage-posts.js';
import { autoStreamVideos } from './facebook/auto-stream.js';
import { delay } from './util/add-delay.js';
import { setPersistentKey } from './obs/set-persistent-key.js';
import { sendTelegramMessage } from './telegram/send-message.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { countFilesInDirectory } from './util/get-file-count.js';
import { getMediaInputStatus } from './obs/get-media-state.js';
import { controlMedia } from './obs/control-media.js';

// KILLS ALL EXISTING CHROME PROCESSES
killChromeProcesses();

function chromeProfileSetup() {
  var chromeActionPromise = undefined;

  // EXECUTES ALL CHROME FUNCTIONALITIES
  if (constants.ADD_HOME_PAGE_IN_CHROME) {
    chromeActionPromise = addHomePageInChrome(
      profiles,
      constants.CUSTOM_WEB_ADDRESS_TO_ENTER
    );
  }

  if (constants.ADD_STARTUP_PAGE_IN_CHROME) {
    if (chromeActionPromise) {
      chromeActionPromise = chromeActionPromise.then(() => {
        return addStartupPageInChrome(
          profiles,
          constants.CUSTOM_WEB_ADDRESS_TO_ENTER
        );
      });
    } else {
      chromeActionPromise = addStartupPageInChrome(
        profiles,
        constants.CUSTOM_WEB_ADDRESS_TO_ENTER
      );
    }
  }

  if (constants.BLOCK_NOTIFICATIONS_IN_CHROME) {
    if (chromeActionPromise) {
      chromeActionPromise = chromeActionPromise.then(() => {
        return blockNotificationsInChrome(profiles);
      });
    } else {
      chromeActionPromise = blockNotificationsInChrome(profiles);
    }
  }

  chromeActionPromise.catch();
}

function interactWithFBPostsHomePage() {
  if (profiles) {
    interactHomePagePosts(profiles[0]).catch();
  } else {
    console.log(
      '[CONFIG]: No profile listed to interact with facebook posts in homepage'
    );
  }
}

async function facebookAutoStream() {
  try {
    var videoNumber = 1;
    var profileIndex = 0;
    var streamProfiles = profiles.slice(0);
    var streamPages = constants.LIVE_SETUP_PAGES_DATA.slice(0);
    var pageIndex = 0;
    var removedPageData;
    var mediaStatus;
    var mediaCursor = 0;
    var strikeDataReturn;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const pathToDirectory = path.resolve(
      __dirname,
      `../${constants.STREAM_FOLDER_NAME}/`
    );

    var numberOfVideosInFolder;
    if (constants.AGGRESSIVE_MODE) {
      numberOfVideosInFolder = constants.NUMBER_OF_VIDEOS;
    } else {
      numberOfVideosInFolder = await countFilesInDirectory(pathToDirectory);
    }

    if (!constants.AGGRESSIVE_MODE) {
      await sendTelegramMessage(
        `[NORMAL]\nAuto Stream Initializing:\nNumber of video(s): ${numberOfVideosInFolder}\nStream duration: ${constants.LIVE_DURATION} min(s)\nInterval between streams: ${constants.INTERVAL_BETWEEN_STREAMS} min(s)\nNumber of admins: ${profiles.length}\nNumber of pages: ${streamPages.length}`
      );
    } else {
      await sendTelegramMessage(
        `[AGGRESSIVE]\nAuto Stream Initializing:\nNumber of video(s): ${numberOfVideosInFolder}\nStream duration: ${constants.LIVE_DURATION} min(s)\nInterval between streams: ${constants.INTERVAL_BETWEEN_STREAMS} min(s)\nNumber of admins: ${profiles.length}\nNumber of pages: ${streamPages.length}`
      );
    }

    while (videoNumber <= numberOfVideosInFolder) {
      await setPersistentKey(streamPages[pageIndex].persistentKey);

      if (videoNumber != 1) {
        mediaStatus = await getMediaInputStatus(
          constants.BACKUP_MEDIA_SOURCE_NAME
        );

        if (mediaStatus.mediaCursor) {
          mediaCursor = mediaStatus.mediaCursor;
        }

        await delay(constants.INTERVAL_BETWEEN_STREAMS * 60);
      }

      console.log(
        `[${streamProfiles[profileIndex]}]\nVideo ${videoNumber} ready to be streamed`
      );
      await sendTelegramMessage(
        `[${streamProfiles[profileIndex]}]\nVideo ${videoNumber} ready to be streamed`
      );

      killChromeProcesses();
      strikeDataReturn = await autoStreamVideos(
        streamProfiles[profileIndex],
        streamPages[pageIndex],
        mediaCursor
      );

      if (strikeDataReturn) {
        if (Object.keys(strikeDataReturn).length) {
          if (strikeDataReturn.strikeRecorded == 'Yes') {
            removedPageData = streamPages.splice(pageIndex, 1);
            console.log(
              `Removed ${removedPageData[0].pageName} from list of streaming setup`
            );

            await sendTelegramMessage(
              `Removed ${removedPageData[0].pageName} from list of streaming setup`
            );
          } else {
            pageIndex += 1;
          }

          if (strikeDataReturn.postBlocked == 'Yes') {
            console.log(
              `Removed ${streamProfiles[profileIndex]} from list of streaming setup`
            );

            await sendTelegramMessage(
              `Removed ${streamProfiles[profileIndex]} from list of streaming setup`
            );

            streamProfiles.splice(
              streamProfiles.indexOf(streamProfiles[profileIndex]),
              1
            );
          } else {
            profileIndex += 1;
          }
        } else {
          profileIndex += 1;
          pageIndex += 1;
        }
      }

      if (profileIndex >= streamProfiles.length) {
        profileIndex = 0;
      }

      if (pageIndex >= streamPages.length) {
        pageIndex = 0;
      }

      videoNumber += 1;

      console.log('------------------------------');

      if (!streamProfiles.length || !streamPages.length) {
        if (!streamProfiles.length && !streamPages.length) {
          console.log('All profiles and pages exhausted, quitting auto-stream');
          await sendTelegramMessage(
            'All profiles and pages exhausted, quitting auto-stream'
          );
        } else {
          if (!streamProfiles.length) {
            console.log('All profiles exhausted, quitting auto-stream');
            await sendTelegramMessage(
              'All admin profiles exhausted, terminating auto stream'
            );
          } else {
            console.log('All pages exhausted, quitting auto-stream');
            await sendTelegramMessage(
              'All pages exhausted, quitting auto-stream'
            );
          }
        }

        return '';
      }
    }
  } catch (err) {
    console.log(err);
    await sendTelegramMessage('An Error Occured: ', err);
  }
}

userInteraction().then((userInput) => {
  if (userInput == 1) {
    chromeProfileSetup();
  } else if (userInput == 2) {
    interactWithFBPostsHomePage();
  } else if (userInput == 3) {
    facebookAutoStream();
  }
});
