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

export default {
  bind: (server) => {
    server.log(['status', 'info', 'keystone'], 'Registering keystone-auth schema');
    return Promise.all([
      bindAuthScheme(server),
      bindRouting(server)
    ]);
  }
};

//I suppose the handler that would prevent user from deleting his default index pattern should be implemented as well
function bindRouting(server) {
  return require('./routing')(server)
    .then((route) => {
      route(server, ['GET', 'POST'], '/{paths*}');
      route(server, ['GET', 'POST'], '/{search_pattern}/_search');
      route(server, 'GET', '/api/saved_objects/_find');
      route(server, 'GET', '/api/kibana/management/saved_objects/_find');
      route(server, 'POST', '/api/saved_objects/_bulk_get');
    });
}

function bindAuthScheme(server) {
  return Promise.all([
    server.auth.scheme(
      'keystone-token',
      require('./auth/scheme')
    ),
    server.auth.strategy(
      'keystone-session',
      'keystone-token',
      require('./auth/strategy')(server)
    )
  ]);
}

//bindExt is removed due to verify being a part of authentication scheme and the other one was no longer relevant
