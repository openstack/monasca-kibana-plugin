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

import mapUri from '../_map_uri';
import createAgent from '../_create_agent';

module.exports = function defaultHandler(server, method, path) {
  return {
    method : method,
    path   : path,
    config : {
      auth : 'keystone-session'
    },
    handler: {
      proxy: {
        mapUri     : (request) => {
          server.log(['route-handler-default'], request.url.path);
          server.log(['status', 'debug', 'keystone'],
            `mapUri for path ${request.url.path}`);
          return {
            uri: mapUri(server, request)
          };
        },
        agent      : createAgent(server),
        passThrough: true,
        xforward   : true
      }
    }
  };
};
