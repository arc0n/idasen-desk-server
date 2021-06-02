const { log, sleep } = require("./utils");
const { getConfig } = require("./config");
const net = require("net");

const process = require("process");
const { spawn } = require("child_process");

const { DeskBridge } = require("./desk/deskBridge");
const { promisify } = require("util");
const fs = require("fs");
const { saveConfig } = require("./config");

const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const { getIdleTime } = require("desktop-idle");
const CHECK_INTERVAL = 5.0; // for start server
let deskBridge;
/**
 * Handler to spawn a child server control the desk via DeskBridge
 */
class DeskServer {
  /**
   * Scan vor desks, returns all found desks or an empty array
   * @returns {Promise<[]|*[]>}
   */
  async scanForDesk() {
    // const config = await getConfig(); // TODO is config needed there?
    console.log("Scanning for desks");
    const bridge = new DeskBridge({
      verbose: false,
    });

    // open promise
    let promiseResovleFn;
    const donePromise = new Promise((resolve) => {
      promiseResovleFn = resolve;
    });

    // start scan
    let scanUntil = +new Date() + 50000;
    // check every second if time wait is already done,
    setInterval(() => {
      if (scanUntil < +new Date()) {
        promiseResovleFn();
      }
    }, 1000);

    let seen = {}; // store for seen devices
    const foundDesks = []; // store for found idasen desks
    bridge.on("discover", (peripheral) => {
      if (
        // check if already not already soon and valid
        peripheral.address &&
        peripheral.advertisement.localName &&
        !seen[peripheral.id]
      ) {
        seen[peripheral.id] = peripheral;
        console.log(
          `  Found "${peripheral.advertisement.localName}" [address: ${peripheral.address}]`
        );
        foundDesks.push({
          deskAddress: peripheral.address,
          deskName: peripheral.advertisement.localName,
        });
        //  scanUntil = +new Date() + 2000; // add more time if something has been found
      }
    });
    bridge.start();

    await donePromise;

    console.log("Done scanning.");
    if (foundDesks.length > 0) {
      console.log(
        `Found ${foundDesks.length} desk${foundDesks.length === 1 ? "" : "s"}.`
      );
      return foundDesks;
    } else {
      console.log(
        "No desks found. Make sure to bring the desk to pairing mode before scanning."
      );
      return [];
    }
  }

  /**
   * write address to config file, always do that before attempt any connection
   * @param address
   * @returns {Promise<void>}
   */
  async setDeskAddressInConfig(address) {
    const config = await getConfig();
    config.deskAddress = address;
    await saveConfig();
  }

  /**
   * spawn a child process to connect and hold a connection the the desk, first use
   * @see this.setDeskAddressInConfig
   * @returns {Promise<boolean>}
   */
  async startDeskServer() {

      await this._runServer().catch((e) => {
        throw Error(e);
      });
      return true;

  }

  /**
   * kills only the connection the the deks
   * @returns {Promise<void>}
   */
  async stopDeskConnection() {
    await this.sendCommand({ op: "disconnect" }, true);
   /* const pid = await this._readPid();
    if (pid !== null) {
      console.log("Stopping server");
      process.kill(pid, 0);
    } else {
      console.log("Server not running");
    }*/
  }

  /**
   *   send commands to the child process where desk socket runs
   */
  async sendCommand(cmd, wait) {
    wait = wait || false;
    const config = await getConfig();
    return new Promise((resolve) => {
      console.log("Sending command", cmd);
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
        console.log("end called");
      });
    });
  }

  /**
   * geht the status of the current desk
   * @returns {Promise<unknown>}
   */
  async getStatus() {
    // TODO ensure server running
    const status = await Promise.race([
      this.sendCommand({ op: "getStatus" }, true),
      sleep(100),
    ]);
    return status || { ready: false };
  }

  /**
   *
   * @returns {Promise<boolean>}
   */
  async serverIsRunning() {
    return (await this._readPid()) !== null;
  }

  /**
   * @internal
   * @returns {Promise<null|number>}
   * @private
   */
  async _readPid() {
    const config = await getConfig();
    try {
      const contents = await readFile(config.pidFilePath, "utf8");
      const pid = parseInt(contents.toString(), 10);
      if (Number.isNaN(pid)) {
        return null;
      }
      try {
        if (process.kill(pid, 0)) {
          // TODO warum killt er hier?
          return pid;
        }
      } catch (e) {
        if (e.code === "EPERM") {
          console.log("error when killing process:", e);
          return pid;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  /**
   * @internal
   * @returns {Promise<void>}
   * @private
   */
  async _writePid() {
    const config = await getConfig();
    await writeFile(config.pidFilePath, `${process.pid}\n`);
  }

  /**
   * @internal
   * @returns {Promise<void>}
   * @private
   */
  async _runServer() {
    const config = await getConfig();
    let sittingTime = 0;

    if(!!deskBridge) {
      this.sendCommand({ op: "reconnect" }, true);
      return;
    }

    deskBridge = new DeskBridge({
      deskAddress: config.deskAddress,
      deskPositionMax: config.deskPositionMax || 58,
      verbose: true,
    });

    setInterval(async () => {
      // TODO what does this do?? only saving the sitting and standing time right?
     const desk =  await Promise.race([deskBridge.getDesk(), sleep(200)]);
        if(desk) {
          console.log("new position in interval", desk.position);
          // someone did something
          const idleTime = getIdleTime();
          if (
              idleTime < CHECK_INTERVAL &&
              desk.position < config.standThreshold
          ) {
            sittingTime += CHECK_INTERVAL;
          } else if (
              desk.position >= config.standThreshold ||
              idleTime >= config.sittingBreakTime
          ) {
            sittingTime = 0;
          }
        }
    }, CHECK_INTERVAL * 1000);

    this._ensureServer(async (message) => {
     if(message.op=== "reconnect") {
        deskBridge.scan();
        return true;
     }
      if (message.op === "disconnect") {
        deskBridge.disconnect();
        return true;
      }
      if (message.op === "moveTo") {
        const desk = await deskBridge.getDesk();
        await desk.moveTo(message.pos);
        return true;
      } else if (message.op === "wait") {
        await deskBridge.getDesk();
        return true;
      } else if (message.op === "getStatus") {
        const desk = await Promise.race([deskBridge.getDesk(), sleep(50)]);
        if (!desk) {
          return { ready: false };
        }
        return {
          ready: true,
          height: desk.position,
          pos: this._describePosition(desk), // TODO remove
          sittingTime,
        };
      } else {
        log("unknown message, ignoring");
        return false;
      }
    }).then(() => {
      console.log("#### ensureServer called ###");
      deskBridge.start();
    });

    process.on("exit", () => {
      console.log("process on exit called");
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

  async _ensureServer(onMessage) {
    const config = await getConfig();

    try {
      await unlink(config.socketPath);
    } catch (e) {
      // doesn't matter
    }

    const deskServer = net
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
          console.log("stream on end");
          connected = false;
        });
      })
      .listen(config.socketPath);

    await this._writePid();

    return deskServer;
  }

  // config must be set! only used on get status on ensureServer
  _describePosition(desk) {
    // TODO remove
    return desk.position >= getConfig().standThreshold ? "standing" : "sitting";
  }
}

module.exports.DeskHandler = DeskServer;
