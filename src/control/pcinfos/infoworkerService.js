const http = require('http');
const options = {
    hostname: 'localhost',
    port: 8085,
    path: '/data.json',
    method: 'GET'
}

class InfoworkerService {

    constructor() {
        this.property = null;
        this.infoArray = [];
        this.looper = null;
    }

    async checkConnection(){
        console.time();
        const data = await this.performHttpRequest();
        console.timeEnd();
        return !!data;
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    async performHttpRequest(){
        let resolverFn;
        const p = new Promise ((res => {
            resolverFn = res;
        }))

        const req = http.request(options, result => {
            let data = '';
            console.log(`Received Data.`);
            result.on("data", chunk => {
                data += chunk;
            })
            result.on("end", ()=>{
                const parsed = JSON.parse(data);
                if(!!parsed.Children && !!parsed.Children[0] && !!parsed.Children[0].Children)
                {
                    resolverFn(parsed.Children[0].Children)

                }
                //Todo Errorhandling
            })
        })

        req.on("error", ()=>{
            resolverFn(null);
            //Todo Errorhandling
        })

        req.end();
        return p;
        //Todo: check if connection to pc is available

        //this.startInfoLoop();
    }

    startInfoLoop(){
        //Todo Call in loop and push into infoarray
        //todo check if a loop is already open
        this.looper = setInterval(() => {
            this.performHttpRequest().then((result)=>{
                this.infoArray.push(result);
            })
        }, 1000)
        console.log("loop started.")
        setTimeout(() => {
            clearInterval(this.looper);
            console.log("loop stops.")
            console.log(this.infoArray.length)
        }, 10000)

    }

    getInfoArray(){
        return this.infoArray || [];
    }



}

module.exports.InfoworkerService = InfoworkerService

