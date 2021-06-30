class PcInfo {

    constructor(obj) {
        //Mainboard
        this.mbName = obj?.mbName;
        this.mbTemps = obj?.mbTemps;
        this.mbFans = obj?.mbFans;

        //CPU
        this.cpuName = obj?.cpuName;
        this.cpuClocks = obj?.cpuClocks;
        this.cpuTemps = obj?.cpuTemps;
        this.cpuLoads = obj?.cpuLoads;
        this.cpuPowers = obj?.cpuPowers;

        //RAM
        this.ramFree = obj?.ramFree;
        this.ramUsed = obj?.ramUsed;
        this.ramTotal = obj?.ramTotal;

        //GPU
        this.gpuName = obj?.gpuName;
        this.gpuClocks = obj?.gpuClocks;
        this.gpuTemps = obj?.gpuTemps;
        this.gpuLoads = obj?.gpuLoads;
        this.gpuFan = obj?.gpuFan;
        this.gpuPower = obj?.gpuPower;
        this.gpuRamFree = obj?.gpuRamFree;
        this.gpuRamUsed = obj?.gpuRamUsed;
        this.gpuRamTotal = obj?.gpuRamTotal;
    }
}

module.exports.PcInfo = PcInfo;