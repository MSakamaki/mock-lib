import * as browserSync from 'browser-sync';
import { resolve } from 'path';

import { DB, UtilRouter, baseContentsPath } from '../dist';

import { AppSampleAPI } from './implement/sample.api';
import { AppSampleDetailAPI } from './implement/sample.detail.api';

const util = new UtilRouter(
  new DB(resolve(__dirname, '_fixture'), 'api'),
  'api',
);
const v2_util = new UtilRouter(
  new DB(resolve(__dirname, '_fixture'), 'api/v2'),
  'api/v2',
);

// registry mock api
const MOCK_API: Array<
  browserSync.PerRouteMiddleware | browserSync.MiddlewareHandler
> = [
  ...util.createAppApi(AppSampleDetailAPI),
  ...util.createAppApi(AppSampleAPI),

  ...v2_util.createAppApi(AppSampleDetailAPI),
  ...v2_util.createAppApi(AppSampleAPI),
];

// Start the server
browserSync({
  middleware: [
    util.addHeaderParameter(),
    ...MOCK_API,
    util.apis([...util.apiList, ...v2_util.apiList]),
  ],
  port: 3030,
  startPath: 'index.html',
  open: false,
  server: {
    baseDir: baseContentsPath(),
    routes: {
      ['/node_modules']: 'node_modules',
    },
  },
});
