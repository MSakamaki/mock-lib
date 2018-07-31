import { Map } from 'immutable';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
// import { fixtureConfig } from './_fixture/config';

export interface IDB {
  reload(apiKey: string): Promise<void>;
  search(apiKey: string): Promise<Fixture>;
  create(apiKey: string, data: object): Promise<void>;
}

export interface Fixture {
  API_KEY: string;
  API_NAME: string;
  data: any | any[];
  dev: Dev;
}

export interface Dev {
  status: number;
  wait: number;
}

/**
 * やらないといけないこと
 * 1. 初期データのロード
 * 2. データの検索
 * 3. データの設定
 */
export class DB implements IDB {
  /**
   * Immutable.Map()
   */
  private DATA = Map<string, Fixture>();

  /**
   * JSONデータ用Prefix RegExp
   */
  private JsonRxp = new RegExp('.json$');

  /**
   * Load initialize data;
   */
  constructor(private fixtreDir: string) {
    this.readFixture(fixtreDir).forEach(fixtre => this.setFixtureData(fixtre));
  }

  /**
   * searchd data
   * @param apiKey 取得するキー
   */
  public async search(apiKey: string): Promise<Fixture> {
    return await (<Fixture>this.DATA.get(apiKey));
  }

  /**
   * 指定したAPIキーのデータを再読込する
   */
  public async reload(apiKey: string): Promise<any> {
    const updateAPIs: any[] = [
      ...this.readFixture(this.fixtreDir).filter(
        (data: any) => data.API_KEY === apiKey,
      ),
    ];

    if (updateAPIs.length === 1) {
      this.DATA = this.DATA.set(apiKey, {
        ...this.DATA.get(apiKey),
        data: updateAPIs[0].data,
      });
    } else {
      throw Error('updateAPIs key not found');
    }
  }

  public async create(apiKey: string, data: any): Promise<void> {
    this.DATA = this.DATA.set(apiKey, <Fixture>{
      ...this.DATA.get(apiKey),
      data: data,
    });
  }

  public async setWait(apiKey: string, wait: number): Promise<void> {
    this.DATA = this.DATA.set(apiKey, <Fixture>{
      ...this.DATA.get(apiKey),
      dev: {
        ...this.DATA.get(apiKey).dev,
        wait: wait,
      },
    });
  }

  public async setState(apiKey: string, state: number): Promise<void> {
    this.DATA = this.DATA.set(apiKey, <Fixture>{
      ...this.DATA.get(apiKey),
      dev: {
        ...this.DATA.get(apiKey).dev,
        state: state,
      },
    });
  }

  private loadFixture(fullpath: any): {} {
    return JSON.parse(readFileSync(fullpath, 'utf-8'));
  }

  private setFixtureData(fixture: Fixture): void {
    this.DATA = this.DATA.set(fixture.API_KEY, {
      ...fixture,
      dev: {
        status: 200,
        wait: 0,
      },
    });
  }

  private readFixture(PATH: string) {
    return readdirSync(PATH)
      .filter((file: string) => this.JsonRxp.test(file))
      .map(files => this.loadFixture(join(PATH, files))) as Fixture[];
  }
}
