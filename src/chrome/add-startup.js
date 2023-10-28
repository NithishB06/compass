import puppeteer from 'puppeteer';

import { constants } from '../constants.js';
import { chromeArgs } from './chrome-args.js';

export async function addStartupPageInChrome(profiles, webAddress) {
  // LAUNCH BROWSER WITH SET CONFIGURATION
  for (let index in profiles) {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: constants.CHROME_EXE_PATH,
      args: chromeArgs.slice(0).concat(`--profile-directory=${profiles[index]}`)
    });

    const page = (await browser.pages())[0];

    // VISITS THE CHROME APPEARANCE PAGE
    await page.goto(constants.CHROME_STARTUP_URL);
    await page.setViewport({
      width: constants.CHROME_VIEW_PORT_WIDTH,
      height: constants.CHROME_VIEW_PORT_HEIGHT
    });

    // SELECT OPEN SPECIFIC PAGE OR SET OF PAGES RADIO BUTTON
    const openSpecificPageElement = await page.evaluateHandle(
      constants.OPEN_SPECIFIC_PAGE_RADIO_BUTTON
    );
    await openSpecificPageElement.click();

    // CLICK ON ADD A NEW PAGE LINK
    const addANewPageLink = await page.evaluateHandle(
      constants.ADD_A_NEW_PAGE_LINK
    );
    await addANewPageLink.click();

    // CLICK ON ADD A NEW PAGE POPUP INPUT BOX
    const addANewPagePopupInputBox = await page.evaluateHandle(
      constants.ADD_A_NEW_PAGE_POPUP_INPUT_BOX
    );
    await addANewPagePopupInputBox.click();

    // ENTER THE WEB ADDRESS AND HIT ENTER
    await page.keyboard.type(webAddress);
    await page.keyboard.press('Enter');

    process.stdout.write(
      `[COMPASS]: Adding startup page in chrome [${+index + 1}/${
        profiles.length
      }] completed`
    );
    process.stdout.cursorTo(0);

    await browser.close();
  }

  process.stdout.write('\n');
}
