import express from "express";
import {ExecException} from "child_process";
var cp = require('child_process');

const shell = require('shelljs')


let position = -1;
/*shell.exec(`idasen-controller --server`, function(code: any, stdout: any, stderr: any) {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
    position = stdout;
});*/

console.log("idasen server started")

const app = express()
const port = 3000

app.get('/', (req, res) => {
    //const { stdout, stderr, code } = shell.exec('idasen-controller')
    res.send({position})
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
        shell.exec(`idasen-controller --move-to ${req.params.position}`, function(code: any, stdout: any, stderr: any) {
            extractPosition(stdout);
        });

        /*--forward */


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


function extractPosition(input: string): number {
    const index = input.lastIndexOf('final height:');
    const filteredByNumbers = input.substr(index, input.lastIndexOf('(')).match(/\d/);
    try {
        const parsed: number = parseInt(filteredByNumbers[0]);
        console.log("parsed input",parsed)
        return parsed;
    }
    catch (e) {return -1};
}
