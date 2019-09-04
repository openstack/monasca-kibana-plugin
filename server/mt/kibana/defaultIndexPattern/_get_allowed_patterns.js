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

export default function (server, project) {
  const logsEnabled = server.config().get('monasca-kibana-plugin.logs');
  const eventsEnabled = server.config().get('monasca-kibana-plugin.events');

  let output = [];
  if (logsEnabled) {
    const pattern = server.config().get('monasca-kibana-plugin.logsIndexPrefix')
      .replace('<project_id>', `${project}`) + '*';
    output += pattern;
  }
  if (eventsEnabled) {
    const pattern = server.config().get('monasca-kibana-plugin.eventsIndexPrefix')
      .replace('<project_id>', `${project}`) + '*';
    output += pattern;
  }
  return output;
}
