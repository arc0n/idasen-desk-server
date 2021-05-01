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
shell.exec(`idasen-controller --server`, function(code: any, stdout: any, stderr: any) {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
});

console.log("idasen server started")

const app = express()
const port = 3000

app.get('/', (req, res) => {
    const { stdout, stderr, code } = shell.exec('idasen-controller --monitor', { silent: true })
    res.send(stdout)
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
        shell.exec(`idasen-controller --forward --move-to ${req.params.position}` );



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
