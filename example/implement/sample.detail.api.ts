import * as http from 'http';
import { DB, IApiClass, BaseAPI } from '../../dist';

export class AppSampleDetailAPI extends BaseAPI implements IApiClass {

    constructor(DB: DB) {
        super(DB, 'sample/:id', 'sample/*[:0-9a-zA-Z-]+');
    }

    public get(req: http.IncomingMessage, res: http.ServerResponse, next: Function): void {
        super.resultJSON(req, res, next);
    }
}
