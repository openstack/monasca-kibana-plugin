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

/**
 * Returns tenant/project-aware kibana index
 *
 * @param server server object
 * @param userObj user details as retrieved from keystone
 * @returns {string} project aware kibana index
 *
 */
export default (server, userObj) => {
  return `${server.config().get('kibana.index')}-${getProjectId(userObj)}`;
};

function getProjectId(userObj) {
  return userObj.project.id;
}
