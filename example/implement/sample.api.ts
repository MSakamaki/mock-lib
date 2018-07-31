import * as http from 'http';
import { DB, IApiClass, BaseAPI } from  '../../dist';

export class AppSampleAPI extends BaseAPI implements IApiClass {

    constructor(DB: DB) {
        super(DB, 'sample');
    }

    public get(req: http.IncomingMessage, res: http.ServerResponse, next: Function): void {
        super.resultJSON(req, res, next);
    }
}
