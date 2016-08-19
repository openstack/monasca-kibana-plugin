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

import Promise from 'bluebird';
import defaultIndexExists from './_exists';
import createDefaultIndex from './_create';
import kibanaIndex from '../kibanaIndex';

export default (server, userObj) => {
  return () => {
    const indexName = kibanaIndex(server, userObj);
    return defaultIndexExists(server, indexName)
      .then((exists) => {
        if (!exists) {
          server.log(['status', 'warning', 'keystone'],
            `Default index pattern for ${indexName} does not exist`);
          return createDefaultIndex(server, indexName, userObj);
        }
        server.log(['status', 'debug', 'keystone'],
          `Default index pattern for ${indexName} already exists`);
        return Promise.resolve();
      });
  };
};
