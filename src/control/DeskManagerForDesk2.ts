// source https://github.com/mitsuhiko/idasen-control/blob/master/src/desk.js

import {Peripheral} from "@abandonware/noble";
import * as noble from "@abandonware/noble";
import schedule from "node-schedule";
import EventEmitter from "events";
import {Desk} from "./Desk2";
import {Utils} from "./utils";




export class DeskManager extends EventEmitter {
    private config: any;
    private started: boolean;
    private desk: any;

    private _deskReadyPromise: Promise<void>;
    private _deskReadyPromiseResolve: () => void;


    constructor(config: any) {
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

    log(...args: string[]) {
        if (this.config.verbose) {
            Utils.log(...args);
        }
    }

    startNoble() {
        console.log("start noble") // TODO remove

        this.log("starting BLE");
        noble.on("discover", async (peripheral: Peripheral) => {
            await this.processPeripheral(peripheral);
        });

        noble.on("stateChange", async (state: string) => {
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
            if (!this.desk && noble.state === "poweredOn") {
                this.scan();
            }
        });
    }

    async scan() {
        if (this.desk) {
            return;
        }

        this.log("Starting scan");
        try {
            await noble.startScanningAsync([], true);
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

    isDeskPeripheral(peripheral: Peripheral) {
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

    async processPeripheral(peripheral: Peripheral) {
        console.log("found some device" ) // TODO remove
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
            this.log("Discovered a desk at", peripheral.address);
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
