export interface Pcinfos {
  //info: String;
  //CPU
  cpuName: string;
  cpuClocks: {Value: string}[];
  cpuLoads: {Value: string}[];
  cpuPowers: string[];
  cpuTemps: {Value: string}[];

  //MB
  mbName: string;
  mbFans: {Value: string, Min: string, Max: string}[];
  mbTemps: {Value: string}[];

  //GPU
  gpuName: string;
  gpuClocks: {Value: string};
  gpuLoads: {Value: string}[];
  gpuFan: {Value: string, Min: string, Max: string};
  gpuPower: string[];
  gpuRamFree: string[];
  gpuRamUsed: string[];
  gpuRamTotal: string[];
  gpuTemps: {Value: string};

  //RAM
  ramUsed: string;
  ramFree: string;


}




