const { PcInfo } = require("./pcInfo");

const http = require("http");
const options = {
  hostname: "192.168.0.150",
  port: 8085,
  path: "/data.json",
  method: "GET",
};

class InfoworkerService {
  pcInfos = new PcInfo();

  constructor() {
    this.property = null;
    this.looper = null;
  }

  async checkConnection() {
    const data = await this.performHttpRequest();
    return !!data;
  }

  /**
   *
   * @returns {Promise<unknown>}
   */
  async performHttpRequest() {
    let resolverFn;
    const p = new Promise((res) => {
      resolverFn = res;
    });

    const req = http.request(options, (result) => {
      let data = "";
      console.log(`Received Data.`);
      result.on("data", (chunk) => {
        data += chunk;
      });
      result.on("end", () => {
        const parsed = JSON.parse(data);
        if (
          !!parsed.Children &&
          !!parsed.Children[0] &&
          !!parsed.Children[0].Children
        ) {
          resolverFn(parsed.Children[0].Children);
        }
        //MB
        this.pcInfos.mbName = parsed.Children[0].Children[0].Text;
        this.pcInfos.mbTemps =
          parsed.Children[0].Children[0].Children[0].Children[1].Children;
        this.pcInfos.mbFans =
          parsed.Children[0].Children[0].Children[0].Children[2].Children;

        //CPU
        this.pcInfos.cpuName = parsed.Children[0].Children[1].Text;
        this.pcInfos.cpuClocks =
          parsed.Children[0].Children[1].Children[0].Children;
        this.pcInfos.cpuTemps =
          parsed.Children[0].Children[1].Children[1].Children;
        this.pcInfos.cpuLoads =
          parsed.Children[0].Children[1].Children[2].Children;
        this.pcInfos.cpuPowers =
          parsed.Children[0].Children[1].Children[3].Children;

        //Memory
        this.pcInfos.ramUsed =
          parsed.Children[0].Children[2].Children[1].Children[0].Value;
        this.pcInfos.ramTotal =
          parsed.Children[0].Children[2].Children[1].Children[1].Value;

        //GPU
        this.pcInfos.gpuName = parsed.Children[0].Children[3].Text;
        this.pcInfos.gpuClocks =
          parsed.Children[0].Children[3].Children[0].Children[0];
        this.pcInfos.gpuTemps =
          parsed.Children[0].Children[3].Children[1].Children[0];
        this.pcInfos.gpuLoads =
          parsed.Children[0].Children[3].Children[2].Children;
        this.pcInfos.gpuFan =
          parsed.Children[0].Children[3].Children[3].Children[0];
        this.pcInfos.gpuPower =
          parsed.Children[0].Children[3].Children[5].Children[0];
        this.pcInfos.gpuRamFree =
          parsed.Children[0].Children[3].Children[6].Children[0];
        this.pcInfos.gpuRamUsed =
          parsed.Children[0].Children[3].Children[6].Children[1];
        this.pcInfos.gpuRamTotal =
          parsed.Children[0].Children[3].Children[6].Children[2];

        //Todo Errorhandling
      });
    });

    req.on("error", () => {
      resolverFn(null);
      //Todo Errorhandling
    });

    req.end();
    return p;
    //Todo: check if connection to pc is available

    //this.startInfoLoop();
  }

  startInfoLoop() {
    if (this.looper) return;
    setInterval(() => {
      if (this.pcInfos) {
        //writePcInfosToDb(this.pcInfos);
      }
    }, 5000);
    this.looper = setInterval(() => {
      this.performHttpRequest().then((result) => {});
    }, 2000);
  }
}

module.exports.InfoworkerService = InfoworkerService;
