import * as browserSync from 'browser-sync';
import {resolve} from 'path';

import { DB, IDB, UrilRouter, baseContentsPath } from '../dist';

import { AppSampleAPI } from './implement/sample.api';
import { AppSampleDetailAPI } from './implement/sample.detail.api';

const DB_BASE: IDB = new DB( resolve(__dirname, '_fixture') );
const util = new UrilRouter(DB_BASE);

// registry mock api
const MOCK_API: Array<
  browserSync.PerRouteMiddleware | browserSync.MiddlewareHandler
> = [
  ...util.createRegexpAppApi(
    'sample/*[0-9a-zA-Z-]+',
    'sample/:id',
    AppSampleDetailAPI,
  ),
  ...util.createAppApi('sample', AppSampleAPI),
];

// Start the server
browserSync({
  middleware: [
    util.addHeaderParameter(),
    ...MOCK_API,
    util.apis(),
  ],
  port: 3030,
  startPath: 'index.html',
  open: false,
  server: {
    baseDir: baseContentsPath(),
    routes: {
      ['/node_modules']: 'node_modules',
    }
  }
});
