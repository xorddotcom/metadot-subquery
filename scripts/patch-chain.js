const compose = require("lodash/fp/compose");
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = "modified-project.yaml";
const NETWORK = "";

function getChainConfig() {
  return path.resolve(__dirname, `../${NETWORK}/config.js`);
}

function getConfigPath(configPath = CONFIG_PATH) {
  return path.resolve(__dirname, "../", configPath);
}

function readConfig(configPath = CONFIG_PATH) {
  const content = fs.readFileSync(getConfigPath(configPath), "utf-8");
  const parsedContent = yaml.parse(content);
  console.log(parsedContent);
  return parsedContent;
}

// readConfig();

function patchTypesToConfig(config) {
  const _config = { ...config };
  console.log("patchTypesToConfig >>> ", _config);

  _config["network"] = {
    genesishash: "",
    endpoint: "",
    dictionary: "",
    chaintypes: {
      file: "./chains/{network}/chaintypes.yaml",
    },
  };

  return _config;
}

function writeConfig(config, configPath = CONFIG_PATH) {
  const _config = yaml.stringify(config, undefined);
  console.log("writeConfig >>> ", _config);

  // fs.writeFileSync(getConfigPath(configPath), _config, { encoding: "utf-8" });
}

const run = compose(writeConfig, patchTypesToConfig, readConfig);

run();
