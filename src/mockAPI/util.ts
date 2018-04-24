import * as http from 'http';
import * as browserSync from 'browser-sync';
import { IDB } from './db';
import { BaseAPI } from './base.api';

// export interface ApiListType {
//   api: string;
//   type: string;
// }

class CreateHandle {
  constructor(private handle: BaseAPI) {}

  /**
   * Application mode routing
   * @param req
   * @param res
   * @param next
   */
  public product(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ) {
    switch (req.method) {
      case 'GET':
        this.handle.get(req, res, next);
        break;
      case 'POST':
        this.handle.post(req, res, next);
        break;
      case 'PUT':
        this.handle.put(req, res, next);
        break;
      case 'DELETE':
        this.handle.delete(req, res, next);
        break;
      default:
        res.statusCode = 500;
        res.end('EXCEPTION METHOD');
        break;
    }
  }
  /**
   * Development routing
   * @param req
   * @param res
   * @param next
   */
  public develop(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ) {
    switch (req.method) {
      case 'GET':
        this.handle.debug_get(req, res, next);
        break;
      case 'PUT':
        this.handle.debug_put(req, res, next);
        break;
      case 'DELETE':
        this.handle.debug_delete(req, res, next);
        break;
      default:
        res.statusCode = 500;
        res.end('EXCEPTION DEVELOP METHOD');
        break;
    }
  }
}

export class UrilRouter {

  public apiList: string[] = [];

  constructor(public DB_BASE: IDB) {}

  /**
   * APIに共通ヘッダを設定する
   */
  public addHeaderParameter() {
    return function MiddleHandle(
      _req: http.IncomingMessage,
      res: http.ServerResponse,
      next: Function,
    ) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    };
  }

  /**
   * IDを含めないシンプルなポータル用APIの作成に利用する。
   */
  public createAppApi(
    uri: string,
    handleClass: new (DB: IDB, uri: string) => BaseAPI,
  ): browserSync.PerRouteMiddleware[] {
    return this.createSimpleApiFactory(uri, handleClass);
  }

  /**
   * IDを含めた複雑なネストするポータル用APIの作成に利用する。
   * 少し重いので基本は createOpeApi の利用を推奨
   * @param uriRegExp マッチングするURL (正規表現)
   * @param API_KEY _fixutreのAPI_KEY件、dummyログイン画面のAPIとして利用する。
   * @param handleClass 対応するAPIの実装
   */
  public createRegexpAppApi(
    uriRegExp: string,
    API_KEY: string,
    handleClass: new (DB: IDB, uri: string) => BaseAPI,
  ): (browserSync.MiddlewareHandler | browserSync.PerRouteMiddleware)[] {
    return this.createRegExpApiFactory(
      uriRegExp,
      API_KEY,
      handleClass,
    );
  }

  public apis(): browserSync.PerRouteMiddleware {
    return {
      route: `/apis`,
      handle: (
        _req: http.IncomingMessage,
        res: http.ServerResponse,
        _next: Function,
      ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.apiList));
      },
    };
  }

  private createSimpleApiFactory(
    uri: string,
    handleClass: new (DB: IDB, uri: string) => BaseAPI,
  ): browserSync.PerRouteMiddleware[] {
    const handle = new handleClass(this.DB_BASE, uri);
    const handler = new CreateHandle(handle);
    this.apiList.push(uri);
    return [
      {
        route: `/api/${uri}`,
        handle: (
          req: http.IncomingMessage,
          res: http.ServerResponse,
          next: Function,
        ) => handler.product(req, res, next),
      },
      {
        route: `/debug/${uri}`,
        handle: (
          req: http.IncomingMessage,
          res: http.ServerResponse,
          next: Function,
        ) => handler.develop(req, res, next),
      },
    ];
  }

  private createRegExpApiFactory(
    uriRegExp: string,
    API_KEY: string,
    handleClass: new (DB: IDB, uri: string) => BaseAPI,
  ): (browserSync.MiddlewareHandler | browserSync.PerRouteMiddleware)[] {
    const regExpUri = new RegExp(`^/api/${uriRegExp}`);
    const handle = new handleClass(this.DB_BASE, API_KEY);
    const handler = new CreateHandle(handle);
    this.apiList.push(API_KEY);
    return [
      MiddleHandle,
      {
        route: `/debug/${API_KEY}`,
        handle: (
          req: http.IncomingMessage,
          res: http.ServerResponse,
          next: Function,
        ) => handler.develop(req, res, next),
      },
    ];

    function MiddleHandle(
      req: http.IncomingMessage,
      res: http.ServerResponse,
      next: Function,
    ) {
      if (req.url && regExpUri.test(req.url)) {
        return handler.product(req, res, next);
      } else {
        return next();
      }
    }
  }
}
