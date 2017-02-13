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
import { pick, sortBy } from 'lodash';

import { SESSION_PROJECTS_KEY, SESSION_TOKEN_KEY } from '../../const';

export default (server, session, userObj) => {

  const usersApi = server.plugins['monasca-kibana-plugin'].users;

  return new Promise((resolve) => {
    return usersApi
      .allProjects({
        params : {
          user_id: userObj.user.id
        },
        headers: {
          'X-Auth-Token'   : session.get(SESSION_TOKEN_KEY),
          'X-Subject-Token': session.get(SESSION_TOKEN_KEY)
        }
      })
      .then((response) => {
        const data = response.data;
        const projects = data.projects;

        return sortBy(
          projects.map(
            project=>pick(project, ['id', 'name', 'description', 'domain_id'])
          ),
          'name'
        );
      })
      .then((projects) => {
        session.set(SESSION_PROJECTS_KEY, projects);
        return resolve(projects);
      });
  });

};
