import {DeskManager} from "../control/DeskManagerForDesk2";
import {Peripheral} from "@abandonware/noble";
import {Config, ConfigHelper} from "../control/Config";


export class DeskHandler {

    private config: Config;

    constructor() {
        this.config = ConfigHelper.getConfig()
    }

    async scanForDesk() {
        // here was the config TODO
        console.log("Scanning for desks");
        const manager = new DeskManager({
            verbose: false,
        });

        // open promise
        let promiseResovleFn: () => void;
        const donePromise = new Promise<void>((resolve) => {
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

        let seen: {[key: string]: any} = {}; // store for seen devices
        // TODO does this only print the devices?
        manager.on("discover", (peripheral: Peripheral) => {
            if ( // check if already not already soon and valid
                peripheral.address &&
                peripheral.advertisement.localName &&
                !seen[peripheral.id]
            ) {
                seen[peripheral.id] = peripheral;
                console.log(
                    `  Found "${peripheral.advertisement.localName}" [address: ${peripheral.address}]`
                );
                found++;
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
                }.  Connect with --connect-to` // TODO will give back some msg or connect to first desk
            );
        } else {
            console.log(
                "No desks found. Make sure to bring the desk to pairing mode before scanning."
            );
        }
    }

}
