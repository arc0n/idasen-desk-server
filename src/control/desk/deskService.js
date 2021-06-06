const {  sleep } = require("../utils");
const { getConfig } = require("../config");



const { DeskBridge } = require("./bluetoothDeskBridge");
const { saveConfig } = require("../config");


const { getIdleTime } = require("desktop-idle");
const CHECK_INTERVAL = 5.0; // for updating position
/**
 * Handler to spawn a child server control the desk via DeskBridge
 */
class DeskService {

  constructor() {
    this.deskBridge = null;
  }
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
    let promiseResoleFn;
    const donePromise = new Promise((resolve) => {
      promiseResoleFn = resolve;
    });

    // start scan
    let scanUntil = +new Date() + 50000;
    // check every second if time wait is already done,
    setInterval(() => {
      if (scanUntil < +new Date()) {
        promiseResoleFn();
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
    this.deskBridge.disconnect();
  }

  async moveTo(position) {
    if (!this.deskBridge) {
      await this.createDeskBridge();
    }
    let desk = await this.getStatus();
    if (!desk) {
      desk = await this.createDeskBridge();
      if(!desk) return false;
    }
    await this.deskBridge.moveTo(position);
    return true;
  }

  /**
   * get the status of the current desk
   * @returns {Promise<any>}
   */
  async getStatus() {
    if (!this.deskBridge) {
      await this.createDeskBridge();
    }
    const status = await Promise.race([this.deskBridge.getDesk(), sleep(100)]);
    return status || false;
  }

  /**
   * @returns {Promise<void>}
   */
  async createDeskBridge() {
    const config = await getConfig();
    let sittingTime = 0;

    if (!this.deskBridge) {
      this.deskBridge = new DeskBridge({
        deskAddress: config.deskAddress,
        deskPositionMax: config.deskPositionMax || 58,
        verbose: true,
      });


      this.deskBridge.on("error", () => {
        throw new Error("Error while starting the Bluetooth device");
      });

      setInterval(() => {
        Promise.race([this.deskBridge.getDesk(), sleep(500)]).then((desk) => {
          if (!!desk) {
            console.log("Desk Position: ", desk?.position);
            // someone did something
            const idleTime = getIdleTime(); // TODO if removed, update the package.json
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
    if (!desk) {
     await this.deskBridge.scan().catch(()=>{});
     let desk = await this.getStatus();
     console.log("DEBUG deskServer desk result: ", desk)
    }
    return desk;
  }
}

module.exports.DeskService = DeskService;
