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

module.exports = function initSession(server) {

  const config = server.config();
  const registerOpts = {
    register: require('yar'),
    options : {
      name         : 'kibana_session',
      storeBlank   : false,
      cache        : {
        expiresIn: config.get('fts-keystone.cookie.expiresIn')
      },
      cookieOptions: {
        password    : config.get('fts-keystone.cookie.password'),
        isSecure    : config.get('fts-keystone.cookie.isSecure'),
        ignoreErrors: config.get('fts-keystone.cookie.ignoreErrors'),
        clearInvalid: true
      }
    }
  };

  const callback = (error) => {
    if (!error) {
      server.log(['session', 'debug'], 'Session registered');
    } else {
      server.log(['session', 'error'], error);
      throw error;
    }
  };

  server.register(registerOpts, callback);
};
