const { execSync } = require("child_process");
const constants = require("../constants");

const killChromeProcesses = () => {
	try {
		execSync(constants.CHROME_KILL_COMMAND, { stdio: "ignore" });
	} catch {}
};

module.exports = killChromeProcesses;
