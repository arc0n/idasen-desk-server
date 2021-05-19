const express = require("express");
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
    await stopDeskServer().catch((err) => res.send(err));
    res.send(true);
});




app.post('/move/:position', async(req, res) => {
    const hasMoved = await sendCommand({ op: "moveTo", pos: 14 }, true); // wait is a bool
    res.send(hasMoved);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
