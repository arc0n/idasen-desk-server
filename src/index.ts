import express from "express";
import {ExecException} from "child_process";
var cp = require('child_process');

const shell = require('shelljs')


/*
const winston = require('winston')
*/
/*
require("./startup/logging")();
*/



const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/move/:position', async(req, res) => {
/*    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    winston.info("Position: ", req.body,  "posted")
*/

    // validate position
    console.log(req.params.position)

    try  {
/*        var child = cp.spawn('./myScript.sh', [args]);
        child.stdout.on('data', function(data) {
            // handle stdout as `data`
        });*/
        shell.exec('sh ./moveDesk.sh --forward --stand')

    }
    catch (e) {
        console.log(e)
    }



    // await some movement
    res.send(true);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
