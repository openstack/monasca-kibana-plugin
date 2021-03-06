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
import yarCookie from '@hapi/yar';
import multiTenancy from '../mt';
import {initClients} from '../mt/kibana/savedObjectsToolkit';

export default (server) => {
  const config = server.config();
  return {
    start: async () => {
      await server.register({
        plugin: yarCookie,
        options: {
          maxCookieSize: 4096,
          name: config.get('monasca-kibana-plugin.cookie.name'),
          storeBlank: false,
          cache: {
            expiresIn: config.get('monasca-kibana-plugin.cookie.expiresIn')
          },
          cookieOptions: {
            password: config.get('monasca-kibana-plugin.cookie.password'),
            isSecure: config.get('monasca-kibana-plugin.cookie.isSecure'),
            ignoreErrors: config.get('monasca-kibana-plugin.cookie.ignoreErrors'),
            clearInvalid: false
          }
        }
      }).catch((err) => {
        throw new Error(err);
      });
      server.log(['status', 'info', 'keystone'], 'Session registered');
      initClients(server);
      await multiTenancy.bind(server);

    }
  };
};
