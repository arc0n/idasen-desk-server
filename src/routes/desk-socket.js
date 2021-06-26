const http = require('http')
const WebSocket = require('ws');
const {log} = require("../control/utils");

class DeskWebSocket {
    /**
     *
     * @param deskService: DeskService
     */
    constructor(deskService) {
        this.deskService = deskService
        this.server = http.createServer();
        if(!!this.deskService) {
            this.init();
        } else{
            log("NO DeskService instance! Position will not be emitted")
        }

    }

    init() {
        const server = this.server;
        this.wss = new WebSocket.Server({server});

        this.wss.on('connection', function connection(ws) {

            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
            });
        });


        this.deskService.on('position', (data) => {
            console.log("position sending")
            this.wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }

            })
        });


        this.server.listen(8080, () => {
            console.log(`Websocket listening at http://localhost:${8080}`);

        });
    }
}

module.exports.DeskWebSocket = DeskWebSocket;
