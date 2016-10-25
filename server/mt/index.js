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

export default  {
  bind: (server) => {
    server.log(['status', 'info', 'keystone'], 'Registering keystone-auth schema');
    return Promise.all([
      bindAuthScheme(server),
      bindExt(server),
      bindRouting(server)
    ]);
  }
};

function bindRouting(server) {
  const kibanaIndex = server.config().get('kibana.index');
  return require('./routing')(server)
    .then((route)=> {
      route(server, 'GET', '/{paths*}');
      route(server, 'POST', '/_mget');
      route(server, 'POST', '/{index}/_search');
      route(server, 'POST', '/{index}/_field_stats');
      route(server, 'POST', '/_msearch');
      route(server, 'POST', '/_search/scroll');
      route(server, ['PUT', 'POST', 'DELETE'], '/' + kibanaIndex + '/{paths*}');
    });
}

function bindAuthScheme(server) {
  return Promise.all([
    server.auth.scheme(
      'keystone-token',
      require('./auth/scheme')
    ),
    server.auth.strategy(
      'session',
      'keystone-token',
      false,
      require('./auth/strategy')(server)
    )
  ]);
}

function bindExt(server) {
  return Promise.all([
    server.ext(
      'onPreAuth',
      require('./auth/verify')(server),
      {after: ['yar']}
    ),
    server.ext('onRequest', require('./verify')(server))
  ]);
}
