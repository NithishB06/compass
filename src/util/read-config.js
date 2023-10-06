const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const configData = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "../../config.yml"), "utf8")
);

module.exports = configData;
