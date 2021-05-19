const express = require("express");
const {sleep} = require("./control/utils");
const {sendCommand} = require("./startup/deskHandler");
const {stopDeskServer} = require("./startup/deskHandler");
const {startDeskServer} = require("./startup/deskHandler");
const {connectToDesk} = require("./startup/deskHandler");
const {scanForDesk} = require("./startup/deskHandler");


const app = express()
const port = 3000


app.get('/', async(req, res) => {
    res.send(true)
    const address = await scanForDesk() // handle reject

    if(!!address) {
        console.log(`Returned address is ${address}`);
        await connectToDesk(address);
        await startDeskServer()
        await sleep(1000)
        console.log(await sendCommand({ op: "moveTo", pos: 14 }, true)); // wait is a bool

        setTimeout(()=> {
            stopDeskServer()
        },100000)

    }
    res.send()
});


app.post('/move/:position', async(req, res) => {
 /*    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    winston.info("Position: ", req.body,  "posted")
*/

    res.send(true);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
