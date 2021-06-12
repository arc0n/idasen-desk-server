const noble = require("@abandonware/noble");
const schedule = require("node-schedule");
const EventEmitter = require("events");

const { Desk } = require("./desk");
const { log } = require("../utils");

/**
 * Source: https://github.com/mitsuhiko/idasen-control
 */
class BluetoothDeskBridge extends EventEmitter {
  constructor(config) {
    super();
    this.deskReady = false;
    this.desk = null;
    this._createReadyPromise();
    this.config = config;
    this.stopScanningPromiseFn = null;
  }

  _createReadyPromise() {
    this._deskReadyPromise = new Promise((resolve) => {
      this._deskReadyPromiseResolve = resolve;
    });
  }

  async getDesk() {
    await this._deskReadyPromise;
    return this.desk;
  }

  async disconnect() {
    if (this.desk) {
      this.desk.disconnect();
      await noble.stopScanningAsync();
      noble.removeListener();
      noble.reset();
    }
    this.desk = null;
    this.deskReady = false;
    this._createReadyPromise();
    this.didUpdateDevice();
  }

  log(...args) {
    if (this.config.verbose) {
      log(...args);
    }
  }

  start() {
    this.log("starting BLE");
    noble.on("discover", async (peripheral) => {
      await this.processPeripheral(peripheral);
    });

    noble.on("stateChange", async (state) => {
      this.log("stateChange", state);
      if (state === "poweredOn") {
        await this.scan();
      } else {
        log("BT device state:", state);

        if (this.desk) {
          this.desk.disconnect();
        }
        this.desk = null;
        this._createReadyPromise();
        this.didUpdateDevice();
      }
    });

    noble.on("scanStop", async () => {
      this.log("scanStop");
    });
  }

  async scan() {
    if (this.desk) {
      return;
    }

    const scanUntil = new Promise((res, rej) => {
      this.stopScanningPromiseFn = res;
      setTimeout(() => res(false), 10000);
    }).then((deskFound) => {
      if (deskFound) return;
      try {
        noble.stopScanning();
      } catch (e) {
        // we dont care, is thrown when no BT support
      }
      this.log("Stopping scan, nothing found");
    });

    this.log("Starting scan");
    try {
      await noble
        .startScanningAsync([], true, (err) => {
          // nothing
        })
        .catch((err) => {
          if (this.handleError(err, true) !== 1) {
            log("BT BLE Error: Scheduling Scan for later");
            this.scheduleScan();
          }
        });
    } catch (e) {
      throw new Error("Error while scanning for BT device");
    }

    await scanUntil;
  }

  scheduleScan() {
    schedule.scheduleJob(Date.now() + 5000, () => {
      if (noble.state === "poweredOn") {
        this.scan().catch(() => {});
      }
    });
  }

  isDeskPeripheral(peripheral) {
    if (peripheral.address === this.config.deskAddress) {
      return true;
    }

    if (!peripheral.advertisement || !peripheral.advertisement.serviceUuids) {
      return false;
    }

    return peripheral.advertisement.serviceUuids.includes(
      Desk.services().control.id
    );
  }

  async processPeripheral(peripheral) {
    if (this.desk || !this.isDeskPeripheral(peripheral)) {
      return;
    }

    this.emit("discover", peripheral);

    if (peripheral.address === this.config.deskAddress) {
      this.log("Found configured desk", peripheral.address);
      this.desk = new Desk(peripheral, this.config.deskPositionMax);
      peripheral.on("disconnect", () => {
        if (this.desk == null) {
          log("desk disconnected");
          this._createReadyPromise();
          return;
        }
        this.log("desk disconnected, going back to scanning");
        this.desk = null;
        this._createReadyPromise();
        this.scan();
      });

      try {
        await noble.stopScanningAsync();
        if (this.stopScanningPromiseFn) this.stopScanningPromiseFn(true);
      } catch (err) {
        // We don't really care
      }

      this.didUpdateDevice();
    } else {
      this.log("Discovered Desk at", peripheral.address);
    }
  }

  didUpdateDevice() {
    if (this.desk) {
      this.desk.on("position", async () => {
        if (!this.deskReady) {
          // TODO deskReady could be replaced with the promise
          this.deskReady = true;
          this._deskReadyPromiseResolve();
        }

        this.emit("position", this.desk.position);
      });
    }
  }

  handleError(err, emitMessage) {
    if (
      err.message.includes("No compatible USB Bluetooth") ||
      err.message.includes("state is unknown (not poweredOn)")
    ) {
      if (emitMessage) {
        log("No Bluetooth support: ", err);
        this.emit("error", 1); // err 1 for no BT device
      }
      return 1;
    }
    log(err);
    return 0;
  }
}

module.exports.DeskBridge = BluetoothDeskBridge;
