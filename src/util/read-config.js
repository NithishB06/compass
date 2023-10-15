import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const configData = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "../../config.yml"), "utf8")
);
