// source: https://github.com/nconrad/idasen-desk-controller/blob/master/src/components/Desk.js

import 'regenerator-runtime/runtime'

const serviceID = '99fa0001-338a-1024-8a49-009c0215f78a'
const charID = '99fa0002-338a-1024-8a49-009c0215f78a'

const positionServiceID = '99fa0020-338a-1024-8a49-009c0215f78a'
const positionCharID = '99fa0021-338a-1024-8a49-009c0215f78a'


export class Desk {


    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    service: BluetoothRemoteGATTService;
/*
    onDisconnected = this.onDisconnected.bind(this); // TODO bind method to this, maybe not needed in ts
*/

    constructor() {
    }

    async request() {
        const options = {
            optionalServices: [
                serviceID, positionServiceID
            ],
            filters: [{
                namePrefix: 'Desk'
            }]
        };
        return navigator.bluetooth.requestDevice(options)
            .then((device: BluetoothDevice) => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
            })
    }

    async connect() {
        if (!this.device) throw 'Device is not connected.';

        this.server = await this.device.gatt.connect();
        this.service = await this.server.getPrimaryService(serviceID);
    }

    disconnect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.disconnect();
    }

    onDisconnected() {
        console.log('Device is disconnected.');
    }



    async moveUp() {
        await this.sendCmd('4700');
    }

    async moveDown() {
        this.sendCmd('4600');
    }

    async _stop() {
        this.sendCmd('FF00');
    }

    async sendCmd(cmd: any) {
        const char = await this.service.getCharacteristic(charID);
        await char.writeValue(hexStrToArray(cmd));
    }

    async getCurrentPosition() {
        const service = await this.server.getPrimaryService(positionServiceID);
        const char = await service.getCharacteristic(positionCharID);
        const value = await char.readValue();

        return value.buffer;
    }

    async onPositionChange(callback: (this:BluetoothRemoteGATTCharacteristic, ev: Event) => void) {
        const service = await this.server.getPrimaryService(positionServiceID);
        const char = await service.getCharacteristic(positionCharID);

        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', callback);
    }

}


function hexStrToArray(hexString: any) {
    let decimals = [];
    for (let i = 0; i < hexString.length; i += 2) {
        decimals.push(parseInt(hexString.substr(i, 2), 16));
    }
    return new Uint8Array(decimals);
}
