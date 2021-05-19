/*
import * as net from "net";
import {log, sleep} from "../control/utils";
import {getConfig} from "../control/config";
*/
const { log, sleep } = require("../control/utils");
const { getConfig } = require("../control/config");
const net = require("net");


const process = require("process");
const {spawn} = require("child_process");

const {DeskManager} = require("../control/deskService");
const {promisify} = require("util");
const fs = require("fs");
const {saveConfig} = require("../control/config");

const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


const { getIdleTime } = require('desktop-idle');
const CHECK_INTERVAL = 5.0; // for start server

// scan for desks
module.exports.scanForDesk = async function scanForDesk() {
    const config = await getConfig()
    console.log("Scanning for desks");
    const manager = new DeskManager({
        verbose: false,
    });

    // open promise
    let promiseResovleFn;
    const donePromise = new Promise((resolve) => {
        promiseResovleFn = resolve;
    });

    // start scan

    let scanUntil = +new Date() + 50000;
    let found = 0;
    // check every second if date is already done, TODO maybe use rxjs
    setInterval(() => {
        if (scanUntil < +new Date()) {
            promiseResovleFn();
        }
    }, 1000);

    let seen = {}; // store for seen devices
    let firstFoundDeskAddress = "";
    manager.on("discover", (peripheral) => {
        if ( // check if already not already soon and valid
            peripheral.address &&
            peripheral.advertisement.localName &&
            !seen[peripheral.id]
        ) {
            seen[peripheral.id] = peripheral;
            console.log(
                `  Found "${peripheral.advertisement.localName}" [address: ${peripheral.address}]`
            );
            firstFoundDeskAddress = peripheral.address
            found++
            scanUntil = +new Date() + 2000;
        }
    });
    manager.start();

    await donePromise;
    console.log("Done scanning.");
    if (found > 0) {
        console.log(
            `Found ${found} desk${
                found === 1 ? "" : "s"
            }.`
        );
        return firstFoundDeskAddress
    } else {
        console.log(
            "No desks found. Make sure to bring the desk to pairing mode before scanning."
        );
        return null
    }
}

// connect to desk with the given address
module.exports.connectToDesk = async function connectToDesk(address) {
    const config = await getConfig()
    config.deskAddress = address;
    await saveConfig()
}
// spawns a service for the desk
module.exports.startDeskServer = async function startDeskServer() {
    const config = await getConfig()
    if (!await serverIsRunning()) {
       /* if (process.env.IDASEN_NO_DAEMON === "1") { // what does this do? i think its a leftover
            console.log("run server")
            runServer();
        } else {*/
            console.log("run process")
            const env = {...process.env, IDASEN_START_SERVER: "1"};
            const [_first, ...argv] = process.argv;
            spawn(process.execPath, argv, {
                env,
                detached: true,
                stdio: "ignore",
            });
        /*}*/
        await sleep(100);

        if(/*process.env.IDASEN_START_SERVER === "1"*/true) {
            console.log("run server")
            runServer();
        }
    } else {
        console.log("already running")
    }
}


module.exports.stopDeskServer = async function stopDeskServer() {
    const config = await getConfig()
    const pid = await readPid();
    if (pid !== null) {
        console.log("Stopping server");
        process.kill(pid);
    } else {
        console.log("Server not running");
    }
}

// send command to child process where server runs (?)
module.exports.sendCommand = async function sendCommand(cmd, wait) {
    wait = wait || false;
    const config = await getConfig();
    return new Promise((resolve) => {
        console.log("create client")
        const client = net.createConnection({ path: config.socketPath }, () => {
            client.write(JSON.stringify(cmd) + "\n", () => {
                if (!wait) {
                    resolve(undefined);
                }
            });
        });
        if (wait) {
            client.on("data", (data) => {
                resolve(JSON.parse(data));
            });
        }
        client.on("end", () => {
            // nothing
        });
    });
}

module.exports.getStatus = async function getStatus() {
    const status = await Promise.race([
        sendCommand({ op: "getStatus" }, true),
        sleep(100),
    ]);
    return status || { ready: false };
}


async function serverIsRunning() {
    return (await readPid()) !== null;
}

async function readPid() {
    const config = await getConfig();
    try {
        const contents = await readFile(config.pidFilePath, "utf8");
        const pid = parseInt(contents.toString(), 10);
        if (Number.isNaN(pid)) {
            return null;
        }
        try {
            if (process.kill(pid, 0)) {
                return pid;
            }
        } catch (e) {
            if (e.code === "EPERM") {
                console.log("eperm");
                return pid;
            }
        }
    } catch (e) {
        // ignore
    }
    return null;
}


async function writePid() {
    const config = await getConfig()
    await writeFile(config.pidFilePath, `${process.pid}\n`);
}


async function runServer() {
    const config = await getConfig();
    let sittingTime = 0;

    const manager = new DeskManager({
        deskAddress: config.deskAddress,
        deskPositionMax: config.deskPositionMax || 58,
        verbose: true,
    });

    setInterval(() => {

        // TODO what does this do?? only saving the sittingand standing time right?
        manager.getDesk().then((desk) => {
            console.log("new position in interval", desk.position)
            // someone did something
            const idleTime = getIdleTime();
            if (idleTime < CHECK_INTERVAL && desk.position < config.standThreshold) {
                sittingTime += CHECK_INTERVAL;
            } else if (
                desk.position >= config.standThreshold ||
                idleTime >= config.sittingBreakTime
            ) {
                sittingTime = 0;
            }
        });
    }, CHECK_INTERVAL * 1000);

    ensureServer(async (message) => {
        if (message.op === "moveTo") {
            const desk = await manager.getDesk();
            await desk.moveTo(message.pos);
            return true;
        } else if (message.op === "wait") {
            await manager.getDesk();
            return true;
        } else if (message.op === "getStatus") {
            const desk = await Promise.race([manager.getDesk(), sleep(50)]);
            if (!desk) {
                return { ready: false };
            }
            return {
                ready: true,
                height: desk.position,
                pos: describePosition(desk),
                sittingTime,
            };
        } else {
            log("unknown message, ignoring");
            return false;
        }
    }).then(() => {
        console.log("#### ensureServer called ###")
        manager.start();
    });

    process.on("exit", () => {
        try {
            fs.unlinkSync(config.pidFilePath);
        } catch (e) {
            // ignore
        }
        try {
            fs.unlinkSync(config.socketPath);
        } catch (e) {
            // ignore
        }
    });
}

async function ensureServer(onMessage) {
    const config = await getConfig();

    try {
        await unlink(config.socketPath);
    } catch (e) {
        // doesn't matter
    }

    const server = net
        .createServer((stream) => {
            let buffer = "";
            let connected = true;
            stream.on("data", async (data) => {
                buffer += data;
                while (true) {
                    const newline = buffer.indexOf("\n");
                    if (newline < 0) {
                        break;
                    }
                    let parsedMsg;
                    try {
                        let msg = buffer.substr(0, newline);
                        buffer = buffer.substr(newline + 1);
                        parsedMsg = JSON.parse(msg);
                    } catch (e) {
                        continue;
                    }

                    log("received request", parsedMsg);
                    let rv = await onMessage(parsedMsg);
                    if (connected) {
                        log("sending response", rv);
                        stream.write(JSON.stringify(rv) + "\n");
                    } else {
                        log("dropping response because client disconnected");
                    }
                }
            });
            stream.on("end", () => {
                connected = false;
            });
        })
        .listen(config.socketPath);

    await writePid();

    return server;
}


// config must be set! only used on get status on ensureServer
function describePosition(desk) {
    return desk.position >= getConfig().standThreshold ? "standing" : "sitting";
}
