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

import {createEventsIndexPattern, createLogsIndexPattern} from './_create';
import {defaultEventsIndexExists, defaultLogsIndexExists} from './_exists';
import {deleteDefaultEventsIndex, deleteDefaultLogsIndex} from './_delete';
import {updateEventsConfig, updateLogsConfig} from './_set_default_index_pattern';

export default (server, userObj) => {
  return () => {
    const project = userObj.project.id;
    return defaultLogsIndexExists(server, userObj)
      .then((logsExists) => {
        if (server.config().get('monasca-kibana-plugin.logs')) {
          server.log(['status', 'info', 'keystone'],
            'Default logs-index pattern is enabled in kibana config file');
          if (!logsExists) {
            server.log(['status', 'warning', 'keystone'],
              `Default logs-index pattern for ${project} does not exist`);
            return createLogsIndexPattern(server, userObj)
              .then(() => {
                return updateLogsConfig(server, userObj);
              });
          } else {
            server.log(['status', 'info', 'keystone'],
              `Default logs-index pattern for ${project} already exists`);
          }
        } else {
          server.log(['status', 'info', 'keystone'],
            'Default logs-index pattern is disabled in kibana config file');
          if (logsExists) {
            server.log(['status', 'warning', 'keystone'],
              `Default logs-index pattern for ${project} exists, but it should not`);
            return deleteDefaultLogsIndex(server, userObj);
          } else {
            server.log(['status', 'info', 'keystone'],
              `Default logs-index pattern for ${project} does not exist`);
          }
        }
      })
      .then(() => {
        defaultEventsIndexExists(server, userObj)
          .then((eventsExists) => {
            if (server.config().get('monasca-kibana-plugin.events')) {
              server.log(['status', 'info', 'keystone'],
                'Default events-index pattern is enabled in kibana config file');
              if (!eventsExists) {
                server.log(['status', 'warning', 'keystone'],
                  `Default events-index pattern for ${project} does not exist`);
                return createEventsIndexPattern(server, userObj)
                  .then(() => {
                    return updateEventsConfig(server, userObj);
                  });
              } else {
                server.log(['status', 'info', 'keystone'],
                  `Default events-index pattern for ${project} already exists`);
              }
            } else {
              server.log(['status', 'info', 'keystone'],
                'Default events-index pattern is disabled in kibana config file');
              if (eventsExists) {
                server.log(['status', 'warning', 'keystone'],
                  `Default events-index pattern for ${project} exists, but it should not`);
                return deleteDefaultEventsIndex(server, userObj);
              } else {
                server.log(['status', 'info', 'keystone'],
                  `Default events-index pattern for ${project} does not exist`);
              }
            }
          });
      });
  };
};
