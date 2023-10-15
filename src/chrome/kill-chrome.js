import { execSync } from "child_process";
import { constants } from "../constants.js";

export const killChromeProcesses = () => {
	try {
		execSync(constants.CHROME_KILL_COMMAND, { stdio: "ignore" });
	} catch {}
};
