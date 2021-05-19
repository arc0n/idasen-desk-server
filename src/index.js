const express = require("express");
const {getStatus} = require("./startup/deskHandler");
const {sleep} = require("./control/utils");
const {sendCommand} = require("./startup/deskHandler");
const {stopDeskServer} = require("./startup/deskHandler");
const {startDeskServer} = require("./startup/deskHandler");
const {connectToDesk} = require("./startup/deskHandler");
const {scanForDesk} = require("./startup/deskHandler");


const app = express();
const port = 3000;


app.post('/connect', async(req, res) => {
    const address = await scanForDesk().catch((err)=> {
        res.send(err)
    });
    if(!!address) {
        console.log(`Returned address is ${address}`);
        await connectToDesk(address);
        await startDeskServer();
        res.send(true);
    }
    res.send("Error: No address found");
});
app.post('/disconnect', async(req, res) => {
    stopDeskServer().catch((err) => res.send(err));
    res.send(true);
});


app.post('/move/:position', async(req, res) => {
    // TODO validate input
    const hasMoved = await sendCommand({ op: "moveTo", pos: req.params.position }, true); // wait is a bool, must be set to true in this api
    // TODO try if wait false works
    res.send(hasMoved);
});
app.get('/status', async(req, res) => {
    // TODO validate input
    const status = await getStatus();
    // TODO try if wait false works
    res.send(status);
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
