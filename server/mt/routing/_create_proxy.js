/*
 * Copyright 2020 FUJITSU LIMITED
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

import { PREFIX } from './_utils';

module.exports = (server, method, route) => {

  const pre = '/elasticsearch';
  const sep = route[0] === '/' ? '' : '/';
  let path;
  if (/\/api.*\//.test(route)) {
    path = `${PREFIX}${sep}${route}`;
  } else {
    path = `${PREFIX}${pre}${sep}${route}`;
  }

  server.log(['create-proxy-path'], path + '; ' + method);

  let options;

  switch (route) {
    case '/_search':
      options = require('./routes/search')(server, method, path);
      break;
    case '/{search_pattern}/_search':
      options = require('./routes/pattern_search')(server, method, path);
      break;
    case '/api/saved_objects/_bulk_get':
      options = require('./routes/bulk_get')(server, method, path);
      break;
    default:
      if (/\/api.*\/saved_objects\/_find/.test(route)) {
        options = require('./routes/find')(server, method, path);
      } else {
        options = require('./routes/default')(server, method, path);
      }
      break;
  }
  return server.route(options);
};
