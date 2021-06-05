const noble = require("@abandonware/noble");
const schedule = require("node-schedule");
const EventEmitter = require("events");
const { sleep } = require("../utils");

const { Desk } = require("./desk");
const { log } = require("../utils");

/**
 * Source: https://github.com/mitsuhiko/idasen-control
 */
class DeskBridge extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.deskReady = false;
    this.desk = null;
    this._createReadyPromise();
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

  disconnect() {
    if (this.desk) {
      this.desk.disconnect();
    }
    this.desk = null;
    this.deskReady = false;
    this._createReadyPromise();
    this.didUpdateDevice();
  }

  start() {
    this._startNoble();
  }

  log(...args) {
    if (this.config.verbose) {
      log(...args);
    }
  }

  _startNoble() {
    this.log("starting BLE");
    noble.on("discover", async (peripheral) => {
      await this.processPeripheral(peripheral);
    });

    noble.on("stateChange", async (state) => {
      this.log("stateChange", state);
      if (state === "poweredOn") {
        await this.scan();
      } else {
        if (this.desk) {
          console.log("BT state:", state);
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
      console.log("DEBUG MESSAGE desk is already there: ", this.desk)
      return;
    }

    const scanUntil = new Promise((res, rej) => {
      setTimeout(() => res(), 10000);
    }).then(() => {
      noble.stopScanning();
      this.log("Stopping scan");

    });

    this.log("Starting scan");
    try {
      await noble.startScanningAsync([], true, (err) =>
      {
    this.handleError(err)
      }).catch(
          (err) => this.handleError(err));
    } catch (err) {
      console.log("Caught BT error: scheduling scan")
      this.scheduleScan();
    }
    await scanUntil;
    return this.desk;
  }

  scheduleScan() {
    schedule.scheduleJob(Date.now() + 5000, () => {
      if (noble.state === "poweredOn") {
        this.scan();
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

  handleError(err) {
    console.error("No Bluetooth support: ", err);
    this.emit("error")
  }
}

module.exports.DeskBridge = DeskBridge;
