import * as http from 'http';
import { join } from 'path';
import * as browserSync from 'browser-sync';
import { IDB } from '../db';
import { BaseAPI } from '../base.api';
import { CreateHandle } from './createhandle';


export class UtilRouter {

  public apiList: string[] = [];

  constructor(public DB_BASE: IDB, public prefix='') {}

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
   * IDを含めた複雑なネストするポータル用APIの作成に利用する。
   * 少し重いので基本は createOpeApi の利用を推奨
   * @param uriRegExp マッチングするURL (正規表現)
   * @param API_KEY _fixutreのAPI_KEY件、dummyログイン画面のAPIとして利用する。
   * @param handleClass 対応するAPIの実装
   */
  public createAppApi(
    handleClass: new (DB: IDB) => BaseAPI,
  ): (browserSync.MiddlewareHandler | browserSync.PerRouteMiddleware)[] {
    return this.createRegExpApiFactory(
      handleClass,
    );
  }

  public apis(_apilist = this.apiList): browserSync.PerRouteMiddleware {
    return {
      route: '/debug/apis',
      handle: (
        _req: http.IncomingMessage,
        res: http.ServerResponse,
        _next: Function,
      ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(_apilist));
      },
    };
  }

  private createRegExpApiFactory(
    handleClass: new (DB: IDB) => BaseAPI,
  ): (browserSync.MiddlewareHandler | browserSync.PerRouteMiddleware)[] {

    const handle = new handleClass(this.DB_BASE);
    const regExpUri = new RegExp(`^/${this.prefix ? this.prefix + '/' : ''}${handle.REG_EXP_PATH || handle.API_KEY}`);
    const handler = new CreateHandle(handle);
    this.apiList.push(join(this.prefix, handle.API_KEY));
    const route = ['/debug', this.prefix, handle.API_KEY].filter(Boolean).join('/');

    return [
      MiddleHandle,
      {
        route: route,
        handle: (
          req: http.IncomingMessage,
          res: http.ServerResponse,
          next: Function,
        ) => handler.develop(req, res, next, this.prefix),
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