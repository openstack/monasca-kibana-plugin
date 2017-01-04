/*
 * Copyright 2016 FUJITSU LIMITED
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

  const serverConfig = server.config();
  const pre = '/elasticsearch';
  const sep = route[0] === '/' ? '' : '/';
  const path = `${PREFIX}${pre}${sep}${route}`;

  let options;

  switch (route) {
    case '/_mget':
      options = require('./routes/mget')(server, method, path);
      break;
    case '/{paths*}':
      options = require('./routes/paths')(server, method, path);
      break;
    default:
      if (route === `/${serverConfig.get('kibana.index')}/{paths*}`) {
        options = require('./routes/kibana_index')(server, method, path);
      } else {
        options = require('./routes/default')(server, method, path);
      }
  }

  return server.route(options);
};
