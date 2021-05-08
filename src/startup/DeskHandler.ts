import {Desk} from "../control/Desk";


export class DeskHandler {

    private desk = new Desk();

    async getCurrentPosition() {
        return await this.desk.getCurrentPosition();
    }

      }
