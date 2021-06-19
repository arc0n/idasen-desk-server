const { PcInfo } = require("./pcInfo");


const http = require('http');
const options = {
    hostname: 'localhost',
    port: 8085,
    path: '/data.json',
    method: 'GET'
}

class InfoworkerService {
    pcInfos = new PcInfo;

    constructor() {
        this.property = null;
        this.infoArray = [];
        this.looper = null;
    }

    async checkConnection() {
        console.time();
        const data = await this.performHttpRequest();
        console.timeEnd();
        return !!data;
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    async performHttpRequest() {
        let resolverFn;
        const p = new Promise((res => {
            resolverFn = res;
        }))

        const req = http.request(options, result => {
            let data = '';
            console.log(`Received Data.`);
            result.on("data", chunk => {
                data += chunk;
            })
            result.on("end", () => {
                const parsed = JSON.parse(data);
                if (!!parsed.Children && !!parsed.Children[0] && !!parsed.Children[0].Children) {
                    resolverFn(parsed.Children[0].Children)

                }
                //MB
                this.pcInfos.mbName = parsed.Children[0].Children[0].Text;
                this.pcInfos.mbTemps = parsed.Children[0].Children[0].Children[0].Children[1].Children;
                this.pcInfos.mbFans = parsed.Children[0].Children[0].Children[0].Children[2].Children;

                //CPU
                this.pcInfos.cpuName = parsed.Children[0].Children[1].Text;
                this.pcInfos.cpuClocks = parsed.Children[0].Children[1].Children[0].Children;
                this.pcInfos.cpuTemps = parsed.Children[0].Children[1].Children[1].Children;
                this.pcInfos.cpuLoads = parsed.Children[0].Children[1].Children[2].Children;
                this.pcInfos.cpuPowers = parsed.Children[0].Children[1].Children[3].Children;

                //Memory
                this.pcInfos.ramUsed = parsed.Children[0].Children[2].Children[1].Children[0].Value;
                this.pcInfos.ramTotal = parsed.Children[0].Children[2].Children[1].Children[1].Value;

                //GPU
                this.pcInfos.gpuName = parsed.Children[0].Children[3].Text;
                this.pcInfos.gpuClocks = parsed.Children[0].Children[3].Children[0].Children[0];
                this.pcInfos.gpuTemps = parsed.Children[0].Children[3].Children[1].Children[0];
                this.pcInfos.gpuLoads = parsed.Children[0].Children[3].Children[2].Children;
                this.pcInfos.gpuFan = parsed.Children[0].Children[3].Children[3].Children[0];
                this.pcInfos.gpuPower = parsed.Children[0].Children[3].Children[5].Children[0];
                this.pcInfos.gpuRamFree = parsed.Children[0].Children[3].Children[6].Children[0];
                this.pcInfos.gpuRamUsed = parsed.Children[0].Children[3].Children[6].Children[1];
                this.pcInfos.gpuRamTotal = parsed.Children[0].Children[3].Children[6].Children[2];



                //TESTING PURPOSES
                //MB
                console.log("- "+this.pcInfos.mbName);
                this.pcInfos.mbTemps.forEach(value => console.log("-- "+value.Text+" "+value.Value))
                this.pcInfos.mbFans.forEach(value => console.log("--- "+value.Text+" "+value.Value))

                //CPU
                console.log("- "+this.pcInfos.cpuName);
                this.pcInfos.cpuClocks.forEach(value => console.log("-- "+value.Text+": "+value.Value))
                this.pcInfos.cpuTemps.forEach(value => console.log("--- "+value.Text+": "+value.Value))
                this.pcInfos.cpuLoads.forEach(value => console.log("---- "+value.Text+": "+value.Value))
                this.pcInfos.cpuPowers.forEach(value => console.log("----- "+value.Text+": "+value.Value))


                //RAM
                console.log("-- Ram in Use: "+this.pcInfos.ramUsed);
                let usedRam = parseFloat(this.pcInfos.ramUsed.replace(",","."));
                let availableRam = parseFloat(this.pcInfos.ramTotal.replace(",","."));
                let totalRam = usedRam+availableRam;
                console.log(("-- Total Ram: "+totalRam+" GB").replace(".",","));

                //GPU
                console.log("- "+this.pcInfos.gpuName);
                console.log("-- "+this.pcInfos.gpuClocks.Text+": "+this.pcInfos.gpuClocks.Value);
                console.log("--- Temperature: "+this.pcInfos.gpuTemps.Value);
                this.pcInfos.gpuLoads.forEach(value => console.log("---- "+value.Text+": "+value.Value));
                console.log("----- Fan: "+this.pcInfos.gpuFan.Value);
                console.log("-- "+this.pcInfos.gpuPower.Text+": "+this.pcInfos.gpuPower.Value);
                console.log("--- "+this.pcInfos.gpuRamFree.Text+": "+this.pcInfos.gpuRamFree.Value);
                console.log("--- "+this.pcInfos.gpuRamUsed.Text+": "+this.pcInfos.gpuRamUsed.Value);
                console.log("--- "+this.pcInfos.gpuRamTotal.Text+": "+this.pcInfos.gpuRamTotal.Value);

                //Todo Errorhandling
            })
        })

        req.on("error", () => {
            resolverFn(null);
            //Todo Errorhandling
        })

        req.end();
        return p;
        //Todo: check if connection to pc is available

        //this.startInfoLoop();
    }

    startInfoLoop() {
        //Todo Call in loop and push into infoarray
        //todo check if a loop is already open
        this.looper = setInterval(() => {
            this.performHttpRequest().then((result) => {
                this.infoArray.push(result);
            })
        }, 1000)
        console.log("loop started.")
        setTimeout(() => {
            clearInterval(this.looper);
            console.log("loop stops.")
            console.log(this.infoArray.length)
        }, 100)

    }

    getInfoArray() {
        return this.infoArray || [];
    }


}

module.exports.InfoworkerService = InfoworkerService

