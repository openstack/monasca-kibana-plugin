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

import Boom from 'boom';

import { exists as indexExists } from './_exists';

export default (server, indexName) => {
  const client = server.plugins.elasticsearch.client;

  server.log(['status', 'info', 'keystone'], `Creating user index ${indexName}`);

  return client.indices
    .create({
      index: indexName,
      body : {
        settings: {
          number_of_shards: 1
        },
        mappings: {
          config: {
            properties: {
              buildNum: {
                type : 'string',
                index: 'not_analyzed'
              }
            }
          },
          'index-pattern': {
            properties: {
              title: {
                type: 'string'
              },
              timeFieldName: {
                type: 'string'
              },
              notExpandable: {
                type: 'boolean'
              },
              intervalName: {
                type: 'string'
              }
            }
          }
        }
      }
    })
    .catch((err)=> {
      throw Boom.wrap(err, 500,
        `Failed to create index ${indexName}`);
    })
    .then(() => {
      return indexExists(server, indexName, 'yellow')
        .catch((err)=> {
          throw Boom.wrap(err, 500,
            `Waiting for index ${indexName} to come online failed`);
        })
        .then(()=> {
          server.log(['status', 'info', 'keystone'],
            `Index ${indexName} has been created`);
          return Promise.resolve(indexName);
        });
    });

};
