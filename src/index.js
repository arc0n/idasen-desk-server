const express = require("express");
 const {scanForDesk} = require("./startup/deskHandler");

const app = express()
const port = 3000


app.get('/', async(req, res) => {
    await scanForDesk()
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
