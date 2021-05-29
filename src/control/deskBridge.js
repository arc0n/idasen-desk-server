const noble = require("@abandonware/noble");
const schedule = require("node-schedule");
const EventEmitter = require("events");

const { Desk } = require("./desk");
const { log } = require("./utils");

/**
 * Source: https://github.com/mitsuhiko/idasen-control
 */
class DeskBridge extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.started = false;
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

  start() {
    this.startNoble();
  }

  log(...args) {
    if (this.config.verbose) {
      log(...args);
    }
  }

  startNoble() {
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
          this.desk.disconnect();
        }
        this.desk = null;
        this._createReadyPromise();
        this.didUpdateDevice();
      }
    });

    noble.on("scanStop", async () => {
      this.log("scanStop");
      /*      if (!this.desk && noble.state === "poweredOn") {
        this.scan();
      }*/ // TODO ASYNC? AND RETURN FALSE
      // KILL
      this.emit("stop");
      this.emit("end");
      setTimeout(() => {
        process.disconnect();
      }, 1000);
    });
  }

  async scan() {
    if (this.desk) {
      return;
    }

    const scanUntil = new Promise((res, rej) => {
      setTimeout(() => res(), 10000);
    }).then(() => {
      noble.stopScanning();
    });

    this.log("Starting scan");
    try {
      await noble.startScanningAsync([], true); // TODO maybe to false?
    } catch (err) {
      this.scheduleScan();
    }
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
        if (!this.started) {
          this.started = true;
          this._deskReadyPromiseResolve();
        }
        this.emit("position", this.desk.position);
      });
    }
  }
}

module.exports.DeskBridge = DeskBridge;
