// Source: https://github.com/mitsuhiko/idasen-control

const fs = require("fs");
const { getConfigFromDb } = require("./dbService");
const { connectToDB } = require("./dbService");
const { writeToDb } = require("./dbService");
const { homedir } = require("os");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function getConfigPath() {
  return homedir() + "/.idasen-control.json";
}

function getDefaultConfig() {
  return {
    pidFilePath: "/tmp/idasen-control.pid",
    standThreshold: 30,
    sittingBreakTime: 2 * 60,
    deskAddress: null,
    deskMaxPosition: 58,
    connectTimeout: 5.0,
    position1: 8,
    position2: 10,
    position3: 58,
  };
}

let cachedConfig = null;

module.exports.loadConfig = async function loadConfig() {
  const path = getConfigPath();
  let config;
  try {
    //config = { ...config, ...JSON.parse(await readFile(path).toString()) };
    config = await getConfigFromDb();
  } catch (e) {
    // ignore load errors
  }
  const defaultvalues = getDefaultConfig();
  config = {
    pidFilePath: config.pidFilePath || defaultvalues.pidFilePath,
    standThreshold: config.standThreshold || defaultvalues.standThreshold,
    sittingBreakTime: config.sittingBreakTime || defaultvalues.sittingBreakTime,
    deskAddress: config.deskAddress || defaultvalues.deskAddress,
    deskMaxPosition: config.deskMaxPosition || defaultvalues.deskMaxPosition,
    connectTimeout: config.connectTimeout || defaultvalues.connectTimeout,
    position1: 8,
    position2: 10,
    position3: 58,
  };
  cachedConfig = config;
};

module.exports.getConfig = async function getConfig() {
  if (!cachedConfig) await module.exports.loadConfig();
  return cachedConfig;
};

module.exports.saveConfig = async function saveConfig() {
  console.log("writing config to db");
  return writeToDb(cachedConfig);
  //await writeFile(getConfigPath(), JSON.stringify(config, null, 2));
};
