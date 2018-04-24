import * as http from 'http';
import * as url from 'url';
import { IDB } from './db';

export interface IApiClass {
  get(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;
  post(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;
  put(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;

  debug_get(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;
  debug_put(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;
}

export interface DevApiStatus {
  id: string;
  status: number;
  wait: number;
  data: any;
  name: string;
}

export class BaseAPI implements IApiClass {
  /** fixutre用、APIの基本キー */
  public API_KEY: string;
  /** api　レスポンスコード(wait, http status) (apiキー + .status) */
  public DEV_API_KEY: string;
  /** fixture data  (apiキー + .name)*/
  public NAME_API_KEY: string;

  /**
   * ローカルデータを取得する
   */
  get data(): Promise<any> {
    return new Promise(async resolve => {
      resolve(this.db.search(this.API_KEY));
    });
  }

  /**
   * コンストラクタ
   * @param DB DBクラス
   * @param api API文字列
   * @param apiType APIタイプ(/app)
   */
  constructor(private db: IDB, apiUrl: string) {

    this.API_KEY = apiUrl;
    this.DEV_API_KEY = `${this.API_KEY}.status`;
    this.NAME_API_KEY = `${this.API_KEY}.name`;
    /** default api status */
    this.db.create(this.DEV_API_KEY, {
      status: 200,
      wait: 0,
    });
  }

  public get(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ERROR_MESSAGE: 'GET NOT FOUND',
      }),
    );
  }

  public post(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ERROR_MESSAGE: 'POST NOT FOUND',
      }),
    );
  }

  public put(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ERROR_MESSAGE: 'PUT NOT FOUND',
      }),
    );
  }

  public delete(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ERROR_MESSAGE: 'DELETE NOT FOUND',
      }),
    );
  }

  /**
   * 開発ステータスを返却する
   */
  public debug_get(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    this.getDevelopState()
      .then(status => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(status));
      })
      .catch(e => console.log('e', e));
  }

  /**
   * 開発ステータスを設定する
   * @param req
   * @param res
   * @param next
   */
  public debug_put(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    this.getBody(req).then(body => {
      const jsonBody: any = JSON.parse(body);
      const data = jsonBody.data;

      this.db
        .create(this.API_KEY, data)
        .then(() => this.setDevelopStatus(jsonBody.status, jsonBody.wait, data))
        .then(() => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              RESULT: 'SET DATA',
            }),
          );
        });
    });
  }

  /**
   * 開発ステータスを再設定（初期化）する
   * @param req
   * @param res
   * @param next
   */
  public debug_delete(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    this.db
      .reload(this.API_KEY)
      .then(() => this.data)
      .then(data => this.setDevelopStatus(200, 0, data))
      .then(() => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            RESULT: 'RESET DATA',
          }),
        );
      });
  }

  /**
   * HTTPリクエストのbodyパラメーターを取得して返却する。
   * @param req
   */
  public getBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('readable', () => {
        body += req.read() || '';
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }

  /**
   * URLのパラメーターを取得する。
   * @param urlStr URL文字列
   */
  getRequestParameter(urlStr: string): Map<string, string> {
    const strQuery = (url.parse(urlStr).query || '') as string;
    const aryQuery = strQuery.split('&');
    return strQuery
      ? aryQuery
          .map(query => ({
            key: query.split('=')[0],
            val: query.split('=')[1],
          }))
          .reduce(
            (map, q) => map.set(q.key, decodeURIComponent(q.val)),
            new Map(),
          )
      : new Map();
  }

  /**
   * ステータスコード200のみを返す
   * @param req
   * @param res
   * @param next
   * @param statusCode 返却したいhttpステータスコード(任意)
   */
  async nomaryResult(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
    statusCode?: number,
  ) {
    const appParam = await this.getDevelopState();

    setTimeout(() => {
      res.statusCode = statusCode || 200;
      res.end();
    }, appParam.wait);
  }

  /**
   * ローカルデータに引数のデータを追加する
   * @param obj 追加するObject (fixutre.dataがArrayでない場合は例外を投げる)
   */
  protected pushDB(obj: Object): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const data = await this.db.search(this.API_KEY);
      if (Array.isArray(data)) {
        data.push(obj);
        this.db.create(this.API_KEY, data).then(resolve);
      } else {
        reject(`${this.API_KEY} of data is not an Array`);
      }
    });
  }

  /**
   * APIにローカルに保持したデータを返却する
   * @param req
   * @param res
   * @param next
   */
  public resultJSON(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ): Promise<any> {
    const resJSON = async (resolve: Function, reject: Function) => {
      const data = await this.db.search(this.API_KEY);
      const appParam = await this.getDevelopState();

      setTimeout(() => {
        res.statusCode = appParam.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        res.on('error', e => reject(e));
        resolve();
      }, appParam.wait);
    };

    return new Promise(resJSON);
  }

  /**
   * 画面に意図したデータを返却する
   * @param req
   * @param res
   * @param next
   * @param json
   */
  public resultCustomJSON(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
    json: any,
  ): Promise<any> {
    const resJSON = async (resolve: Function, reject: Function) => {
      const appParam = await this.getDevelopState();
      console.log('appParam.wait', appParam.wait);
      setTimeout(() => {
        res.statusCode = appParam.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json));
        res.on('error', e => reject(e));
        resolve();
      }, appParam.wait);
    };

    return new Promise(resJSON);
  }

  /**
   * ステータス返却
   */
  public getDevelopState(): Promise<DevApiStatus> {
    return Promise.all([
      this.db.search(this.DEV_API_KEY),
      this.db.search(this.API_KEY),
      this.db.search(this.NAME_API_KEY),
    ]).then((results: any): DevApiStatus => ({
      id: this.API_KEY,
      wait: results[0].wait,
      status: results[0].status,
      data: results[1],
      name: results[2],
    }));
  }

  /**
   * ステータスのセット
   * @param status HTTPステータス
   * @param wait APIの待機時間
   */
  public setDevelopStatus(
    status: number,
    wait: number,
    _data: any,
  ): Promise<any> {
    const setDevParam = async (resolve: any, reject: any) => {
      const apiDATA = await this.getDevelopState();
      if (this.NotUndefined(status)) {
        apiDATA.status = status;
      }
      if (this.NotUndefined(wait)) {
        apiDATA.wait = wait;
      }
      this.db
        .create(this.DEV_API_KEY, apiDATA)
        .then(resolve)
        .catch(reject);
    };
    return new Promise(setDevParam);
  }

  /**
   * undefinedかどうかを確認する
   * @param param 確認するパラメータ
   */
  private NotUndefined(param: any): boolean {
    return 'undefined' !== typeof param;
  }
}
