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


import {updateConfig} from "../savedObjectsToolkit";

export async function updateLogsConfig(server, userObj) {
  const pattern = server.config().get('monasca-kibana-plugin.logsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';

  return await updateDefaultIndexPattern(server, pattern);
}

export async function updateEventsConfig(server, userObj) {
  const pattern = server.config().get('monasca-kibana-plugin.eventsIndexPrefix')
    .replace('<project_id>', `${userObj.project.id}`) + '*';

  return await updateDefaultIndexPattern(server, pattern);
}

async function updateDefaultIndexPattern(server, pattern) {
  const type = 'config';
  const version = server.config().get('pkg.version');
  const changes = {
    defaultIndex: pattern
  };

  return await updateConfig(type, version, changes)
    .catch((err) => {
      server.log(['updateConfig'], `Can't set ${pattern} as default index pattern, error is: ${err}`);
    })
    .then(() => {
      server.log(['updateConfig'], `Default index pattern is ${pattern}`);
    });
}
