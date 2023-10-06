const constants = require("../constants");

const profileNumbers = [];
var chromeProfileRanges = constants.CHROME_PROFILE_RANGES;
var chromeProfiles = constants.CHROME_PROFILES;

if (chromeProfileRanges) {
	for (
		let number = chromeProfileRanges[0];
		number <= chromeProfileRanges[1];
		number++
	) {
		profileNumbers.push(number);
	}
}

if (chromeProfiles) {
	for (let chromeProfile of chromeProfiles) {
		profileNumbers.push(chromeProfile);
	}
}

profileNumbers.sort((a, b) => a - b);

const profiles = [];
var profileString;
var profileName;

if (profileNumbers) {
	for (let profileNumber of profileNumbers) {
		if (profileNumber < 100) {
			if (profileNumber < 10) {
				profileString = "00" + String(profileNumber);
			} else {
				profileString = "0" + String(profileNumber);
			}
		} else {
			profileString = String(profileNumber);
		}

		profileName = constants.CHROME_PROFILE_PATTERN + profileString;
		profiles.push(profileName);
	}
}

module.exports = profiles;
