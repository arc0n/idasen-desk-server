import express from "express";
import {ExecException} from "child_process";
var cp = require('child_process');
const {chunksToLinesAsync, chomp} = require('@rauschma/stringio');


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

        var child = cp.spawn(`idasen-controller --move-to ${req.params.position}`, [], {shell: true, stdio: [ 'pipe', process.stderr, process.stdin]});

   emitLines(process.stdin)
          process.stdin.resume()
          process.stdin.setEncoding('utf8')
          process.stdin.on('line', function (line) {
           console.log('line event:', line)
             })
/*        child.stdout.on('data', function(data: any) {
            console.log(data.toString())
            // handle stdout as `data`
        });*/
/*        shell.spawn(`idasen-controller --move-to ${req.params.position}`, function(code: any, stdout: any, stderr: any) {
            console.log()
            position = extractPosition(stdout);
        });*/




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

/*async function echoReadable(readable: any) {
    for await (const line of chunksToLinesAsync(readable)) { // (C)
        console.log('LINE: '+chomp(line))
    }
}*/
function extractPosition(input: string): number {
    const index = input.lastIndexOf('Final height:');
    const filteredByNumbers = input.substring(index, input.lastIndexOf('(')).match(/\d.*/);
    try {
        const parsed: number = parseInt(filteredByNumbers[0]);
        return parsed;
    }
    catch (e) {return -1};
}

function emitLines (stream: any) {
    var backlog = ''
    stream.on('data', function (data: any) {
        backlog += data
        var n = backlog.indexOf('\n')
        // got a \n? emit one or more 'line' events
        while (~n) {
            stream.emit('line', backlog.substring(0, n))
            backlog = backlog.substring(n + 1)
            n = backlog.indexOf('\n')
        }
    })
    stream.on('end', function () {
        if (backlog) {
            stream.emit('line', backlog)
        }
    })
}
