// source https://github.com/mitsuhiko/idasen-control/blob/master/src/desk.js

import fs from "fs";
import { homedir } from "os";
import {promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


export interface Config {
    socketPath: string;
    pidFilePath: string;
    standThreshold: number;
    sittingBreakTime: number;
    deskAddress: any, // TODO type
    deskMaxPosition: number;
    connectTimeout: number;
}


const DEFAULT_CONFIG: Config = {
    socketPath: "/tmp/idasen-control.sock",
    pidFilePath: "/tmp/idasen-control.pid",
    standThreshold: 30,
    sittingBreakTime: 2 * 60,
    deskAddress: null,
    deskMaxPosition: 58,
    connectTimeout: 5.0,
};


export class ConfigHelper {

    private constructor() {
    }

    private static cachedConfig: Config = null;

    static async loadConfig() {
        const path: string = this.getConfigPath();
        let config: Config = DEFAULT_CONFIG;
        try {
            config = { ...config, ...JSON.parse((await readFile(path)).toString()) };
            console.log("Used stored config in ~/.idasen-control.json")
        } catch (e) {
            // ignore load errors
            console.log("Used default Config, did not find any file with ~/.idasen-control.json")

        }

        this.cachedConfig = config;
    };

    static getConfig() {
        return this.cachedConfig;
    };

    static async saveConfig() {
        await writeFile(
            this.getConfigPath(),
            JSON.stringify(await module.exports.getConfig(), null, 2)
        );
    };


    static getConfigPath(): string {
        return homedir() + "/.idasen-control.json";
    }
}

/*

function getConfigPath() {
    return homedir() + "/.idasen-control.json";
}

function getDefaultConfig(): {} {
    return {
        socketPath: "/tmp/idasen-control.sock",
        pidFilePath: "/tmp/idasen-control.pid",
        standThreshold: 30,
        sittingBreakTime: 2 * 60,
        deskAddress: null,
        deskMaxPosition: 58,
        connectTimeout: 5.0,
    };
}

let cachedConfig: any = null;*/

/*module.exports.loadConfig = async function loadConfig() {
    const path = getConfigPath();
    let config = getDefaultConfig();
    try {
        config = { ...config, ...JSON.parse((await readFile(path)).toString()) };
    } catch (e) {
        // ignore load errors
    }

    cachedConfig = config;
};*/

/*
module.exports.getConfig = function getConfig() {
    return cachedConfig;
};
*/
/*

module.exports.saveConfig = async function saveConfig() {
    await writeFile(
        getConfigPath(),
        JSON.stringify(await module.exports.getConfig(), null, 2)
    );
};
*/
