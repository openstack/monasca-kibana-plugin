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

import indexExists from './_exists';
import createIndex from './_create';
import configureIndex from './_configure';

export default (server, userObj) => {
  return doCheck();

  function doCheck() {
    return indexExists(server, userObj)
      .then(({indexName, resp}) => {
        if (!resp || resp.timed_out) {
          server.log(['status', 'warning', 'keystone'], `Index ${indexName} does not exists`);
          return createIndex(server, indexName);
        }
        if (resp.status === 'red') {
          server.log(['status', 'warning', 'keystone'], `Shards not ready for index ${indexName}`);
          return Promise.delay(2500).then(doCheck);
        }
        return Promise.resolve(indexName);
      })
      .then((indexName)=> {
        return configureIndex(server, indexName);
      });
  }
};
