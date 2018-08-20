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

export default (server, indexName, userObj) => {
  server.log(['status', 'info', 'keystone'],
    `Creating default events-index pattern for ${indexName}`);

  const client = server.plugins.elasticsearch.client;
  const pattern = server.config().get('monasca-kibana-plugin.eventsIndexPrefix')
                  .replace('<project_id>', `${userObj.project.id}`) + '*';

  return client.create({
    index: indexName,
    type : 'index-pattern',
    body : {
      title: pattern,
      timeFieldName : server.config().get('monasca-kibana-plugin.defaultEventsTimeField')
    },
    id   : pattern
  })
  .then(() => {
    return client.update({
      index: indexName,
      type: 'config',
      id: server.config().get('pkg.version'),
      body: {
        doc: {
          defaultIndex: pattern
        }
      }
    });
  })
  .then(() => {
    return client.indices.refresh({
      index: indexName,
      force: true
    });
  })
  .then((response) => {
    return Promise.resolve(response);
  })
  .catch((err)=> {
    throw new Error(`Unable to setup events-index pattern, error is ${err}`);
  });
};
