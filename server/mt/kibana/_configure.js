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

import { find } from 'lodash';
import Promise from 'bluebird';

import canUpgradeConfig from './_can_upgrade';

export default (server, indexName) => {
  const config = server.config();
  const client = server.plugins.elasticsearch.client;
  const options = {
    index: indexName,
    type : 'config',
    body : {
      size: 1000,
      sort: [
        {
          buildNum: {
            order          : 'desc',
            ignore_unmapped: true
          }
        }
      ]
    }
  };

  server.log(['status', 'debug', 'keystone'], `Configuring index ${indexName}`);

  return client
    .search(options)
    .then(upgradeConfig(server, indexName))
    .then(()=>{
      return Promise
        .delay(666)
        .then(() => {
          server.log(['status', 'debug', 'keystone'], `Index ${indexName} has been configured`);
          return indexName;
        });
    })
    .catch((err)=> {
      throw new Error(`Configuring ${indexName} failed, error is ${err}`);
    });

  function upgradeConfig(server, indexName) {
    const client = server.plugins.elasticsearch.client;
    const config = server.config();

    return (response) => {
      if (response.hits.hits.length === 0) {
        return client.create({
          index: indexName,
          type : 'config',
          body : {
            buildNum: config.get('pkg.buildNum')
          },
          id   : config.get('pkg.version')
        });
      }

      // if we already have a the current version in the index then we need to stop
      var devConfig = find(response.hits.hits, function currentVersion(hit) {
        return hit._id !== '@@version' && hit._id === config.get('pkg.version');
      });

      if (devConfig) {
        return Promise.resolve();
      }

      // Look for upgradeable configs. If none of them are upgradeable
      // then resolve with null.
      let body = find(response.hits.hits, canUpgradeConfig.bind(null, server));
      if (!body) {
        return Promise.resolve();
      }

      // if the build number is still the template string (which it wil be in development)
      // then we need to set it to the max interger. Otherwise we will set it to the build num
      body._source.buildNum = config.get('pkg.buildNum');

      server.log(['plugin', 'elasticsearch'], {
        tmpl       : 'Upgrade config from <%= prevVersion %> to <%= newVersion %>',
        prevVersion: body._id,
        newVersion : config.get('pkg.version')
      });

      return client.create({
        index: indexName,
        type : 'config',
        body : body._source,
        id   : config.get('pkg.version')
      });
    };
  }

};
