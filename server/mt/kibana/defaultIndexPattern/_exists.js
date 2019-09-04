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

import {find} from "../savedObjectsToolkit";

export async function defaultLogsIndexExists(server, userObj) {
  const pattern = server.config().get('monasca-kibana-plugin.logsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';
  server.log(['status', 'debug', 'keystone'],
    `Checking if default logs-index pattern for ${userObj.project.id} exists...`);

  return await patternExists(server, pattern);
}

export async function defaultEventsIndexExists(server, userObj) {
  const pattern = server.config().get('monasca-kibana-plugin.eventsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';
  server.log(['status', 'debug', 'keystone'],
    `Checking if default events-index pattern for ${userObj.project.id} exists...`);

  return await patternExists(pattern);
}

async function patternExists(pattern) {
  const params = {
    type: 'index-pattern',
    fields: ['title'],
  };

  return find(params)
    .then((response) => {
      return response.saved_objects.some(el => el.attributes.title === pattern);
    }).catch((err) => {
      throw new Error(`Checking if ${pattern} exists failed, error is ${err}`);
    });
}
