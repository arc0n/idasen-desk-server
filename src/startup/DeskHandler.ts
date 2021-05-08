import {Desk} from "../control/Desk";


export class DeskHandler {

    private desk = new Desk();

    constructor() {
        this.desk.onPositionChange((event: Event)=> {
            console.log("event", event)
        })
    }

    async getCurrentPosition() {
        await this.desk.request();
        await this.desk.connect()
        console.log("desk connected", this.desk.server)
        return await this.desk.getCurrentPosition();
    }

/*    async moveToPosition(){
        await this.desk.moveToPosition()
    }*/

      }
