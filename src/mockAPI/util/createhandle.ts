import * as http from 'http';
import { BaseAPI } from '../base.api';


export class CreateHandle {
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
      case 'PATCH':
        this.handle.patch(req, res, next);
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
    prefix: string,
  ) {
    switch (req.method) {
      case 'GET':
        this.handle.debug_get(req, res, next, prefix);
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