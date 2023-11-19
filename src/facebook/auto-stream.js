import puppeteer from 'puppeteer';
import { constants } from '../constants.js';
import { chromeArgs } from '../chrome/chrome-args.js';
import { readTextFile } from '../util/read-stream-titles.js';
import { delay } from '../util/add-delay.js';
import { getSourceId } from '../obs/get-source-id.js';
import { toggleThumbnailVisibility } from '../obs/toggle-thumbnail-visibility.js';
import { controlMedia } from '../obs/control-media.js';
import { controlAudio } from '../obs/control-audio.js';
import { fetchOBSStrikeStatus } from '../obs/obs-strike-stats.js';
import { moveNextVideo } from '../obs/move-next-video.js';
import { setStreamStatus } from '../obs/set-stream-status.js';
import { addMinutes } from '../util/add-minutes-to-date.js';
import clipboard from 'clipboardy';
import { sendTelegramMessage } from '../telegram/send-message.js';
import { TimeoutError } from 'puppeteer';
import {
  getDateString,
  getScreenshotSavePath
} from '../util/screenshot-helper.js';
import { setMediaCursor } from '../obs/set-media-cursor.js';
import { getMediaInputStatus } from '../obs/get-media-state.js';
import readline from 'readline';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

export async function autoStreamVideos(profile, pageData, mediaCursor = 0) {
  try {
    // OBS BASIC SETUP //
    var thumbnailSourceId = await getSourceId(
      constants.SCENE_NAME,
      constants.THUMBNAIL_SOURCE_NAME
    );

    var backupMediaSourceId = await getSourceId(
      constants.SCENE_NAME,
      constants.BACKUP_MEDIA_SOURCE_NAME
    );

    var mediaSourceId = await getSourceId(
      constants.SCENE_NAME,
      constants.MEDIA_SOURCE_NAME
    );

    await toggleThumbnailVisibility(
      constants.SCENE_NAME,
      thumbnailSourceId,
      true
    );

    await toggleThumbnailVisibility(
      constants.SCENE_NAME,
      backupMediaSourceId,
      false
    );

    await toggleThumbnailVisibility(constants.SCENE_NAME, mediaSourceId, true);

    await controlAudio(constants.MEDIA_SOURCE_NAME, 'mute');

    await controlAudio(constants.BACKUP_MEDIA_SOURCE_NAME, 'mute');

    await controlMedia(constants.MEDIA_SOURCE_NAME, 'pause');

    await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, 'pause');

    // ----------------- //

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: constants.CHROME_EXE_PATH,
      args: chromeArgs.slice(0).concat(`--profile-directory=${profile}`)
    });

    const page = (await browser.pages())[0];

    await page.setViewport({
      width: constants.CHROME_VIEW_PORT_WIDTH,
      height: constants.CHROME_VIEW_PORT_HEIGHT
    });

    // VISITS THE PAGE URL
    await page.goto(pageData.pageURL, {
      timeout: 0
    });

    // CHECK IF THE PAGE HAS SWITCH BUTTON - TO IDENTIFY IF CURRENT LOGIN IS USER OR PAGE
    var pageSwitchButton =
      (await page.$(constants.SWITCH_TO_PAGE_BUTTON)) || null;

    if (!pageSwitchButton) {
      pageSwitchButton =
        (await page.$(constants.SWITCH_NOW_TO_PAGE_BUTTON)) || null;
      if (pageSwitchButton) {
        await pageSwitchButton.click();
        await page.waitForNavigation();
      }
    } else {
      await pageSwitchButton.click();

      await page.waitForSelector(constants.SEE_ALL_PROFILES_BUTTON);

      const switchConfirmButton = await page.evaluateHandle(
        `document.querySelector("${constants.SEE_ALL_PROFILES_BUTTON}").parentNode.parentNode.childNodes[0].childNodes[0]`
      );

      await switchConfirmButton.click();
      await page.waitForNavigation();
    }

    // CHECK FOLLOWER COUNT BEFORE STREAM RUN
    const likesAndFollowers = await page.$$(
      constants.LIKES_AND_FOLLOWERS_SELECTOR
    );

    const followerElement = likesAndFollowers.at(-1);
    const followerText = await followerElement.evaluate((el) => el.innerText);

    var followers = followerText.split(' ')[0];

    // CHECK STRIKE COUNT BEFORE STREAM RUN
    var totalStrikes = 0;
    await page.goto(constants.PAGE_QUALITY_PAGE, {
      waitUntil: 'networkidle0'
    });

    const pageQualitySpanSelectors = await page.$$(
      constants.PAGE_QUALITY_PAGE_SPAN_SELECTOR
    );
    for (let pageQualitySpanSelector of pageQualitySpanSelectors) {
      var spanInnerText = (
        await pageQualitySpanSelector.evaluate((el) => el.innerText)
      ).toLowerCase();

      if (spanInnerText.includes(constants.STRIKE_IDENTIFIER_TEXT)) {
        totalStrikes += 1;
      }
    }

    var seeMoreSelector = (await page.$(constants.SEE_MORE_SELECTOR)) || null;

    if (seeMoreSelector) {
      var innerTextContent = await seeMoreSelector.evaluate(
        (el) => el.innerText
      );

      var additionalStrikeCount = Number(innerTextContent.split('(')[1][0]);
      totalStrikes += additionalStrikeCount;
    }

    console.log('Page Name: ', pageData.pageName);
    console.log('Total Followers: ', followers);
    console.log('Total Strikes: ', totalStrikes);

    await sendTelegramMessage(
      `Pre-stream stats:\nPage name: ${pageData.pageName}\nTotal followers: ${followers}\nTotal strikes: ${totalStrikes}`
    );

    // GO TO LIVE SETUP URL AND WAIT FOR FULL PAGE TO LOAD
    await page.goto(pageData.liveSetupURL, {
      waitUntil: 'networkidle0'
    });
    await page.waitForSelector(constants.LIVE_SETUP_GO_LIVE_BUTTON, {
      visible: true
    });

    var goLiveSetupButton = await page.$(constants.LIVE_SETUP_GO_LIVE_BUTTON);
    await goLiveSetupButton.click();

    try {
      await page.waitForSelector(constants.SWITCH_SELECTOR);
    } catch (error) {
      console.log(error);
      await sendTelegramMessage(
        `${profile} post blocked, proceeding to exclude from the list of profiles\nError:${error}`
      );

      var currentDateTimeString = getDateString();
      const directoryPath = getScreenshotSavePath('facebook');

      const imageFilePath = `${directoryPath}\\${currentDateTimeString}.png`;

      await page.screenshot({
        path: imageFilePath,
        fullPage: true
      });
      return {
        strikeRecorded: 'No',
        postBlocked: 'Yes'
      };
    }

    // CLOSE ALL POPUPS BY CLICKING ON CLOSE BUTTON
    var closeButtons = await page.$$(constants.CLOSE_BUTTON_SELECTOR);
    for (let closeButton of closeButtons) {
      await closeButton.click();
    }

    // FIND ALL BUTTONS AND LIST DOWN ADD A GROUP, AUDIENCE SETTINGS AND TITLE DESCRIPTION BUTTONS
    var buttons = await page.$$(constants.BUTTON_SELECTOR);
    var addGroupButton;
    var audienceSettingsButton;
    var titleDescriptionButton;
    var goLiveButton;

    for (let button of buttons) {
      var textContent = (
        await button.evaluate((el) => el.textContent)
      ).toLowerCase();
      if (textContent == constants.ADD_A_GROUP_TO_PROMOTE_TEXT) {
        addGroupButton = button;
      } else if (textContent == constants.AUDIENCE_SETTINGS_TEXT) {
        audienceSettingsButton = button;
      } else if (textContent == constants.TITLE_DESCRIPTION_TEXT) {
        titleDescriptionButton = button;
      }
    }

    // CLICK ON ADD A GROUP BUTTON AND WAIT FOR FULL LOAD
    await addGroupButton.click();
    await page.waitForSelector(constants.REMOVE_BUTTON_SELECTOR);

    // SELECT GROUP TO PROMOTE AND CLOSE THE OPTION POPUP
    var radioButtons = await page.$$(constants.RADIO_BUTTON_SELECTOR);
    for (let radioButton of radioButtons) {
      textContent = await radioButton.evaluate((el) => el.textContent);

      if (textContent == constants.GROUP_NAME) {
        var radioButtonStatus = (
          await radioButton.evaluate((el) => el.ariaChecked)
        ).toLowerCase();

        if (radioButtonStatus == constants.FALSE_KEYWORD) {
          await radioButton.click();
          (await page.$$(constants.CLOSE_BUTTON_SELECTOR)).at(-1).click();
          break;
        }
      }
    }

    await page.waitForFunction(
      `document.querySelector("${constants.REMOVE_BUTTON_SELECTOR}") === null`
    );

    // CLICK ON AUDIENCE SETTINGS AND WAIT FOR OPTION POPUP
    var loopCount = 0;
    while (true) {
      loopCount += 1;
      try {
        await audienceSettingsButton.click();
        await page.waitForSelector(constants.SAVE_BUTTON_SELECTOR);
        break;
      } catch {
        await delay(2);
        if (loopCount >= 3) {
          break;
        }
      }
    }

    // CLICK ON AGE COMBOBOX OPTION AND SELECT PRESET AGE CATEGORY
    var audienceSettingComboboxSelector = await page.$(
      constants.AUDIENCE_SETTING_COMBOBOX_SELECTOR
    );

    await audienceSettingComboboxSelector.click();
    const audienceRestrictionOptions = await page.$$(constants.OPTION_SELECTOR);

    for (let audienceRestrictionOption of audienceRestrictionOptions) {
      var ageText = (
        await audienceRestrictionOption.evaluate((el) => el.innerText)
      ).toLowerCase();

      if (ageText == constants.AUDIENCE_RESTRICTION) {
        await audienceRestrictionOption.click();
        (await page.$(constants.SAVE_BUTTON_SELECTOR)).click();
        break;
      }
    }

    await page.waitForFunction(
      `document.querySelector("${constants.SAVE_BUTTON_SELECTOR}") === null`
    );

    // CLICK ON STREAMING SOFTWARE AND ACTIVATE PERSISTENT KEY
    const streamingSoftwareElement = await page.$(
      constants.STREAMING_SOFTWARE_SELECTOR
    );
    await streamingSoftwareElement.click();

    await page.waitForSelector(constants.STREAM_KEY_INPUT_SELECTOR);

    buttons = await page.$$(constants.BUTTON_SELECTOR);
    for (let button of buttons) {
      var buttonText = (
        await button.evaluate((el) => el.innerText)
      ).toLowerCase();

      if (buttonText == constants.ADVANCED_SETTINGS_TEXT) {
        await button.click();
        await page.waitForSelector(constants.STREAM_SERVER_URL_SELECTOR);
        break;
      }
    }

    var switches = await page.$$(constants.SWITCH_SELECTOR);
    for (let Switch of switches) {
      var switchStatus = (
        await Switch.evaluate((el) => el.ariaChecked)
      ).toLowerCase();

      var switchText = (
        await Switch.evaluate((el) => el.innerText)
      ).toLowerCase();

      if (switchText.startsWith(constants.PERSISTENT_STREAM_KEY_TEXT)) {
        if (switchStatus == constants.FALSE_KEYWORD) {
          await Switch.click();
        }
        break;
      }
    }

    // ADD TO STORY
    var checkBox = await page.$(constants.CHECKBOX_SELECTOR);
    var checkBoxStatus = await checkBox.evaluate((el) => el.ariaChecked);

    if (constants.ADD_TO_STORY) {
      if (checkBoxStatus.toLowerCase() == constants.FALSE_KEYWORD) {
        await checkBox.click();
      }
    } else {
      if (checkBoxStatus.toLowerCase() != constants.FALSE_KEYWORD) {
        await checkBox.click();
      }
    }

    // READ TITLE AND DESCRIPTION
    const title = readTextFile('title.txt');
    const description = readTextFile('description.txt');

    // ADD TITLE AND DESCRIPTION
    if (titleDescriptionButton) {
      await titleDescriptionButton.click();
      await page.waitForSelector(constants.SAVE_BUTTON_SELECTOR);

      const titleTextBox = (await page.$$(constants.TEXT_BOX_SELECTOR)).at(-1);
      await titleTextBox.click();
      clipboard.writeSync(title);
      await page.keyboard.down('ControlLeft');
      await page.keyboard.press('KeyV');

      const descriptionBox = await page.$(constants.DESCRIPTION_SELECTOR);
      await descriptionBox.click();
      clipboard.writeSync(description);
      await page.keyboard.down('ControlLeft');
      await page.keyboard.press('KeyV');

      const saveTitleDescription = await page.$(constants.SAVE_BUTTON_SELECTOR);
      await saveTitleDescription.click();
    } else {
      const titleTextBox = (
        await page.$$(constants.INPUT_LETTER_BOX_SELECTOR)
      ).at(-1);

      await titleTextBox.click();
      clipboard.writeSync(title);
      await page.keyboard.down('ControlLeft');
      await page.keyboard.press('KeyV');

      const descriptionTextBox = await page.$(
        constants.DESCRIPTION_PLACEHOLDER_SELECTOR
      );
      await descriptionTextBox.click();
      clipboard.writeSync(description);
      await page.keyboard.down('ControlLeft');
      await page.keyboard.press('KeyV');
    }

    // START OBS ACTIONS
    await setStreamStatus('start');

    // CLICK ON GO LIVE BUTTON
    await page.waitForFunction(
      `document.querySelector("${constants.GO_LIVE_BUTTON_SELECTOR}") === null`
    );

    buttons = await page.$$(constants.BUTTON_SELECTOR);
    for (let button of buttons) {
      var innerText = (
        await button.evaluate((el) => el.innerText)
      ).toLowerCase();

      if (innerText == constants.GO_LIVE_BUTTON_TEXT) {
        goLiveButton = button;
      }
    }

    const gamingPageCheckOne =
      (await page.$$(constants.GAMING_PAGE_CHECK_SELECTOR)) || null;
    const gamingPageCheckTwo =
      (await page.$$(constants.GAMING_PAGE_CHECK_SELECTOR_ALT)) || null;

    if (gamingPageCheckOne.length || gamingPageCheckTwo.length) {
      await goLiveButton.click();
      await page.waitForSelector(constants.TAG_A_GAME_SELECTOR);

      const goLiveConfirmation = (await page.$$(constants.GO_LIVE_SELECTOR)).at(
        -1
      );
      await goLiveConfirmation.click();
    } else {
      await goLiveButton.click();
    }

    var nowPlusXMinutes = addMinutes(new Date(), constants.LIVE_DURATION);
    var liveJustStarted = true;
    var videoDeleted = false;
    var viewCountSpan;
    var viewerCountRaw;
    var viewerCount;
    var conservativeMode = false;
    var toConservativeMode = constants.CONSERVATIVE_MODE;

    while (new Date() < nowPlusXMinutes) {
      if (liveJustStarted) {
        await delay(20);
        await toggleThumbnailVisibility(
          constants.SCENE_NAME,
          thumbnailSourceId,
          false
        );
        await delay(2);
        await controlMedia(constants.MEDIA_SOURCE_NAME, 'play');
        liveJustStarted = false;
      }

      try {
        await page.waitForSelector(constants.LIVE_VIDEO_ENDED_SELECTOR, {
          timeout: 1000
        });
        var deleteVideoAndReturn = (
          await page.$$(constants.QUICK_ACTIONS_SELECTOR)
        ).at(-1);
        await deleteVideoAndReturn.click();
        await page.waitForSelector(constants.CONFIRM_BUTTON_SELECTOR);

        var confirmDeleteButton = (
          await page.$$(constants.CONFIRM_BUTTON_SELECTOR)
        ).at(-1);
        await confirmDeleteButton.click();

        console.log('Video abruptly ended due to Strike');
        await sendTelegramMessage(
          'Video taken down due to strike, handled abrupt deletion'
        );
        videoDeleted = true;

        var obsStrikeStats = {};
        if (conservativeMode) {
          obsStrikeStats = await fetchOBSStrikeStatus(
            constants.BACKUP_MEDIA_SOURCE_NAME
          );
        } else {
          obsStrikeStats = await fetchOBSStrikeStatus(
            constants.MEDIA_SOURCE_NAME
          );
        }

        console.log('OBS Strike Stats: ', obsStrikeStats);
        await sendTelegramMessage(
          `OBS Strike Stats: \nCursor: ${obsStrikeStats.currentCursor}\nDuration: ${obsStrikeStats.totalDuration}\nImage path: ${obsStrikeStats.imagePath}`
        );

        // HANDLE OBS - FOR ABRUPT DELETION //
        await setStreamStatus('stop');
        if (!constants.AGGRESSIVE_MODE) {
          await moveNextVideo(constants.MEDIA_SOURCE_NAME);
        }
        await delay(1);
        await toggleThumbnailVisibility(
          constants.SCENE_NAME,
          thumbnailSourceId,
          true
        );

        await controlMedia(constants.MEDIA_SOURCE_NAME, 'pause');
        await delay(5);

        console.log('Handled video abrupt deletion');

        if (conservativeMode) {
          console.log(
            `Stream met with strike even after running in conservative mode`
          );
          await sendTelegramMessage(
            `Stream met with strike even after running in conservative mode`
          );
        }

        var totalStrikesAfterStrike = 0;
        var strikeRecorded = 'No';
        var postBlocked = 'No';

        // STRIKE RECORD CHECK //
        await page.goto(constants.PAGE_QUALITY_PAGE, {
          waitUntil: 'networkidle0'
        });

        const pageQualitySpanSelectors = await page.$$(
          constants.PAGE_QUALITY_PAGE_SPAN_SELECTOR
        );
        for (let pageQualitySpanSelector of pageQualitySpanSelectors) {
          spanInnerText = (
            await pageQualitySpanSelector.evaluate((el) => el.innerText)
          ).toLowerCase();

          if (spanInnerText.includes(constants.STRIKE_IDENTIFIER_TEXT)) {
            totalStrikesAfterStrike += 1;
          }
        }

        seeMoreSelector = (await page.$(constants.SEE_MORE_SELECTOR)) || null;

        if (seeMoreSelector) {
          var innerTextContent = await seeMoreSelector.evaluate(
            (el) => el.innerText
          );

          var additionalStrikeCount = Number(innerTextContent.split('(')[1][0]);
          totalStrikesAfterStrike += additionalStrikeCount;
        }

        if (totalStrikesAfterStrike > totalStrikes) {
          strikeRecorded = 'Yes';
        }

        // POST BLOCK CHECK //
        await page.goto(pageData.liveSetupURL, {
          waitUntil: 'networkidle0'
        });
        await page.waitForSelector(constants.LIVE_SETUP_GO_LIVE_BUTTON, {
          visible: true
        });

        goLiveSetupButton = await page.$(constants.LIVE_SETUP_GO_LIVE_BUTTON);
        await goLiveSetupButton.click();

        try {
          await page.waitForSelector(constants.SWITCH_SELECTOR, {
            timeout: 10000
          });
        } catch {
          postBlocked = 'Yes';
        }

        // SEND POST STRIKE DATA //
        await sendTelegramMessage(
          `Post Strike Information:\nStrike recorded: ${strikeRecorded}\nProfile post blocked: ${postBlocked}`
        );

        await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, 'pause');

        // REMOVE ADMIN //
        if (postBlocked == 'Yes') {
          try {
            await page.goto(constants.PAGE_ACCESS_URL, {
              waitUntil: 'networkidle0'
            });

            const ans = await askQuestion(
              'Are you sure you want to proceed with admin removal? '
            );

            var removeAdminThreeDots = await page.$(
              constants.PAGE_ADMIN_REMOVE_OPTION
            );
            await removeAdminThreeDots.click();

            await page.waitForSelector(constants.PAGE_ADMIN_REMOVE_ACCESS_MENU);

            var removeAccessMenu = (
              await page.$$(constants.PAGE_ADMIN_REMOVE_ACCESS_MENU)
            ).at(-1);

            await removeAccessMenu.click();

            await page.waitForSelector(
              constants.PAGE_ADMIN_REMOVE_CONFIRM_BUTTON
            );

            var passwordFieldBox = await page.$(constants.PASSWORD_FIELD);
            await passwordFieldBox.click();

            await page.keyboard.type(constants.ADMIN_PASSWORD, {
              delay: 100
            });

            var confirmAdminRemoveButton = await page.$(
              constants.PAGE_ADMIN_REMOVE_CONFIRM_BUTTON
            );

            await confirmAdminRemoveButton.click();

            try {
              await page.waitForNavigation({
                timeout: 10000
              });
            } catch {
              passwordFieldBox = await page.$(constants.PASSWORD_FIELD);
              await passwordFieldBox.click();

              await page.keyboard.down('Control');
              await page.keyboard.down('A');

              await page.keyboard.up('A');
              await page.keyboard.up('Control');

              await page.keyboard.type(constants.ADMIN_PASSWORD_BACKUP, {
                delay: 100
              });

              await confirmAdminRemoveButton.click();

              await page.waitForNavigation({
                timeout: 10000
              });

              await sendTelegramMessage(
                `Successfully removed admin ${profile} from page ${pageData.pageName}`
              );
            }
          } catch (error) {
            console.log(error);
            console.log(
              `Unable to remove admin ${profile} from page ${pageData.pageName}`
            );
          }
        }

        await browser.close();
        return {
          strikeRecorded: strikeRecorded,
          postBlocked: postBlocked
        };

        // break;
      } catch (e) {
        if (e instanceof TimeoutError) {
          if (toConservativeMode && !conservativeMode) {
            viewCountSpan = (
              await page.$$(constants.SPAN_TAGS_DURING_LIVE_SELECTOR)
            )[4];
            viewerCountRaw = await viewCountSpan.evaluate(
              (el) => el.textContent
            );

            if (viewerCountRaw.includes(',')) {
              viewerCountRaw = viewerCountRaw.replace(',', '');
            }

            viewerCount = Number(viewerCountRaw);
            if (viewerCount > constants.VIEWER_COUNT_THRESHOLD) {
              await toggleThumbnailVisibility(
                constants.SCENE_NAME,
                backupMediaSourceId,
                true
              );

              while (true) {
                if (
                  (
                    await getMediaInputStatus(
                      constants.BACKUP_MEDIA_SOURCE_NAME
                    )
                  ).mediaState == 'OBS_MEDIA_STATE_PLAYING'
                ) {
                  await controlMedia(
                    constants.BACKUP_MEDIA_SOURCE_NAME,
                    'pause'
                  );
                  break;
                }
              }

              await setMediaCursor(
                constants.BACKUP_MEDIA_SOURCE_NAME,
                mediaCursor
              );

              await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, 'play');

              await controlMedia(constants.MEDIA_SOURCE_NAME, 'pause');

              conservativeMode = true;
            }
          }
        }
      }
    }

    if (!videoDeleted) {
      var endLiveVideoButton = await page.$(constants.END_LIVE_VIDEO_SELECTOR);
      await endLiveVideoButton.click();

      await page.waitForSelector(constants.CONFIRM_END_LIVE_VIDEO_SELECTOR);

      var endLiveVideoConfirmButton = await page.$(
        constants.CONFIRM_END_LIVE_VIDEO_SELECTOR
      );
      await endLiveVideoConfirmButton.click();

      await page.waitForSelector(constants.QUICK_ACTIONS_SELECTOR);

      deleteVideoAndReturn = (
        await page.$$(constants.QUICK_ACTIONS_SELECTOR)
      ).at(-1);
      await deleteVideoAndReturn.click();

      await page.waitForSelector(constants.CONFIRM_BUTTON_SELECTOR);

      confirmDeleteButton = (
        await page.$$(constants.CONFIRM_BUTTON_SELECTOR)
      ).at(-1);

      await confirmDeleteButton.click();

      console.log('Graceful delete successfully completed');
      await sendTelegramMessage('Video successfully streamed and deleted');

      // HANDLE OBS - FOR GRACEFUL DELETION //
      await setStreamStatus('stop');
      if (!constants.AGGRESSIVE_MODE) {
        await moveNextVideo(constants.MEDIA_SOURCE_NAME);
      }
      await delay(1);
      await toggleThumbnailVisibility(
        constants.SCENE_NAME,
        thumbnailSourceId,
        true
      );

      await controlMedia(constants.MEDIA_SOURCE_NAME, 'pause');

      await controlMedia(constants.BACKUP_MEDIA_SOURCE_NAME, 'pause');

      await delay(5);

      console.log('Handled graceful deletion');
    }

    if (conservativeMode) {
      console.log(
        `Successfully ran and deleted the video in Conservative Mode`
      );
      await sendTelegramMessage(
        `Successfully ran and deleted the video in Conservative Mode`
      );
    }

    await browser.close();
  } catch (error) {
    console.log(error);
    await sendTelegramMessage(`An error occured: ${error}`);
  }
}
