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
    let foundDesks = []; // store for found idasen desks

    bridge.on("error", () => {
      console.log("Error, BT BLE not supported");
      scanUntil = +new Date() + 2000;
      throw new Error("no BLE Support");
    });
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
        scanUntil = +new Date() + 2000; // stop scanning
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
   * kills only the connection the the deks
   * @returns {Promise<void>}
   */
  async stopDeskConnection() {
    deskBridge.disconnect();
  }

  /*/!**
   *   send commands to the child process where desk socket runs
   *!/
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
  }*/

  async moveTo(position) {
    if (!deskBridge) {
      await this.startDeskServer();
    }
    const desk = await deskBridge.getStatus();
    if (!desk || desk.ready === false) {
      await this.startDeskServer();
    }
    await deskBridge.moveTo(position);
    return true;
  }

  /**
   * get the status of the current desk
   * @returns {Promise<any>}
   */
  async getStatus() {
    if (!deskBridge) {
      await this.startDeskServer();
    }
    const status = await Promise.race([deskBridge.getDesk(), sleep(100)]);
    return status || { ready: false };
  }

  /**
   * @returns {Promise<void>}
   */
  async runServer() {
    const config = await getConfig();
    let sittingTime = 0;

    console.log("Deskbridge Debug:", deskBridge);
    if (!deskBridge) {
      deskBridge = new DeskBridge({
        deskAddress: config.deskAddress,
        deskPositionMax: config.deskPositionMax || 58,
        verbose: true,
      });


      deskBridge.on("error", () => {
        throw new Error("Error while starting the Bluetooth device");
      });

      setInterval(() => {
        Promise.race([deskBridge.getDesk(), sleep(500)]).then((desk) => {
          if (!!desk) {
            console.log("new position in interval", desk?.position);
            // someone did something
            const idleTime = getIdleTime();
            if ( // TODO refactor this logic
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
        });
      }, CHECK_INTERVAL * 1000);
    }

    let desk = await this.getStatus();
    console.log("Debug Message Desk", desk);
    if (!desk || desk.ready === false) {
      console.log("Debug Message SCAN", desk);
      desk = await deskBridge.scan();
    }

    return desk;
  }
}

module.exports.DeskServer = DeskServer;
