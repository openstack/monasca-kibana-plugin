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

import {createSavedObject} from '../savedObjectsToolkit';

export async function createLogsIndexPattern(server, userObj) {
  server.log(['status', 'info', 'keystone'],
    `Creating default logs-index pattern for ${userObj.project.id}`);
  const pattern = server.config().get('monasca-kibana-plugin.logsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';

  return await createIndexPattern(server, pattern);
}

export async function createEventsIndexPattern(server, userObj) {
  server.log(['status', 'info', 'keystone'],
    `Creating default events-index pattern for ${userObj.project.id}`);
  const pattern = server.config().get('monasca-kibana-plugin.eventsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';

  return await createIndexPattern(server, pattern);
}

async function createIndexPattern(server, pattern) {
  let timeFieldName = server.config().get('monasca-kibana-plugin.defaultTimeField');
  const type = 'index-pattern';
  const params = {
    title: pattern,
    timeFieldName: timeFieldName,
  };
  const options = {
    id: pattern,
    overwrite: true
  };

  return createSavedObject(type, params, options)
    .then(() => {
      server.log(['status', 'info', 'keystone', 'create'], `Created ${type} ${pattern}`);
    });
}
