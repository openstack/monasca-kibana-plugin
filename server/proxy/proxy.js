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

const Boom = require('boom');
const retrieveToken = require('./retrieveToken');
const TokensApi = require('keystone-v3-client/lib/keystone/tokens');

const util = require('../util/');

module.exports = function (server) {
  const config = server.config();
  const tokensApi = new TokensApi({
    url: `${config.get('fts-keystone.url')}:${config.get('fts-keystone.port')}`
  });

  return (request, reply) => {
    const requestPath = getRequestPath(request);
    let token;

    if (shouldCallKeystone(requestPath)) {
      server.log(
        ['keystone', 'debug'],
        `Call for ${requestPath} detected, authenticating with keystone`
      );

      token = retrieveToken(server, request);
      if (token.isBoom) {
        return reply(token);
      }

      return tokensApi
        .check({
          headers: {
            'X-Auth-Token'   : token,
            'X-Subject-Token': token
          }
        })
        .then(onFulfilled, onFailed);

    }

    return reply.continue();

    function onFulfilled() {
      reply.continue();
    }

    function onFailed(error) {

      server.log(
        ['keystone', 'error'],
        `Failed to authenticate token ${token} with keystone,
            error is ${error.statusCode}.`
      );

      if (error.statusCode === 401) {
        request.session.clear('keystone_token');
        reply(Boom.forbidden(
          `
               You\'re not logged in as a
               user who\'s authenticated to access log information
          `
        ));
      } else {
        reply(Boom.internal(
          error.message || 'Unexpected error during Keystone communication',
          {},
          error.statusCode
        ));
      }
    }

  };
};

function getRequestPath(request) {
  return request.url.path;
}

function shouldCallKeystone(path) {
  return util.startsWith(path, '/elasticsearch');
}
