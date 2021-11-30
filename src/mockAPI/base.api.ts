import * as http from 'http';
import * as url from 'url';
import { DB, Fixture } from './db';

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
  patch(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;

  debug_get(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
    prefix: string,
  ): void;

  debug_put(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;

  debug_delete(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;
}

export interface ApiDevStatus {
  id: string;
  wait: number;
  status: number;
  data: any;
  name: string;
}

export class BaseAPI implements IApiClass {
  /**
   * ローカルデータを取得する
   */
  get data(): Promise<any> {
    return new Promise(async resolve => {
      resolve(this.db.search(this.API_KEY));
    }).then((fixtre: Fixture) => fixtre.data);
  }

  /**
   * コンストラクタ
   * @param DB DBクラス
   * @param API_KEY API文字列
   * @param REG_EXP_PATH match url regexp string
   */
  constructor(
    private db: DB,
    public API_KEY: string,
    public REG_EXP_PATH = '',
  ) {}

  public head(
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

  public patch(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _next: Function,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ERROR_MESSAGE: 'PATCH NOT FOUND',
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
    _prefix: string,
  ) {
    this.getDevelopState()
      .then(status => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            ...status,
            prefix: _prefix,
          }),
        );
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
    this.getBody(req).then(async body => {
      const jsonBody: any = JSON.parse(body);

      await this.db.create(this.API_KEY, jsonBody.data);
      await this.db.setWait(this.API_KEY, jsonBody.wait);
      await this.db.setState(this.API_KEY, jsonBody.status);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          RESULT: 'SET DATA',
        }),
      );
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
      .then(() => this.db.setState(this.API_KEY, 200))
      .then(() => this.db.setWait(this.API_KEY, 0))
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
      res.statusCode = statusCode || appParam.status;
      res.end();
    }, appParam.wait);
  }

  /**
   * ローカルデータに引数のデータを追加する
   * @param obj 追加するObject (fixutre.dataがArrayでない場合は例外を投げる)
   */
  protected pushDB(obj: Object): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const fixture = await this.db.search(this.API_KEY);
      if (Array.isArray(fixture.data)) {
        fixture.data.push(obj);
        this.db.create(this.API_KEY, fixture.data).then(resolve);
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
      const fixture = await this.db.search(this.API_KEY);
      const appParam = await this.getDevelopState();

      setTimeout(() => {
        res.statusCode = appParam.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(fixture.data));
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
  public async getDevelopState(): Promise<ApiDevStatus> {
    const fixture = await this.db.search(this.API_KEY);
    return {
      id: fixture.API_KEY,
      wait: fixture.dev.wait,
      status: fixture.dev.status,
      data: fixture.data,
      name: fixture.API_NAME,
    };
  }
}
