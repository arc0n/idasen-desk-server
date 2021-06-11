import {Injectable} from "@angular/core";
import { Storage } from '@ionic/storage-angular';

@Injectable()
export class StorageService {
  private _storage: Storage | null = null;
  private readyPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    let readyFn: ()=> void;
    this.readyPromise = new Promise<void>((res)=> {
      readyFn = res;
    });
    this._storage = await this.storage.create();
    readyFn();
  }

  public async set(key: string, value: any) {
    await this.readyPromise;
    await this._storage.set(key, value);
  }

  public async get(key:string) {
    await this.readyPromise;
    return await this._storage.get(key);

  }

}
