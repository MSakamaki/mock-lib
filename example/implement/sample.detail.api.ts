import * as http from 'http';
import { IDB, IApiClass, BaseAPI } from '../../dist';

export class AppSampleDetailAPI extends BaseAPI implements IApiClass {

    constructor(DB: IDB, uri: string) {
        super(DB, uri);
    }

    public get(req: http.IncomingMessage, res: http.ServerResponse, next: Function): void {
        super.resultJSON(req, res, next);
    }
}
