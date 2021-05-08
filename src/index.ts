import express from "express";
import {DeskHandler} from "./startup/DeskHandler";

const app = express()
const port = 3000

const deskHandler = new DeskHandler();

app.get('/', async(req, res) => {
    await deskHandler.scanForDesk();
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
