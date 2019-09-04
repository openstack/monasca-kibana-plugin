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

import {findWithMeta} from '../../kibana/savedObjectsToolkit';
import {filterResponse} from "../_utils";
import {SESSION_USER_KEY} from '../../../const';
import getAllowedPatterns from '../../kibana/defaultIndexPattern/_get_allowed_patterns';

export default function (server, method, path) {
  return {
    method: method,
    path: path,
    config: {
      auth: 'keystone-session',
    },
    handler: handler
  };

  async function handler(request, reply) {
    const userObj = request.yar.get(SESSION_USER_KEY);
    const project = userObj.project.id;
    const patterns = getAllowedPatterns(server, project);
    const params = request.query;

    if (params.fields && !(params.fields instanceof Array)) {
      params.fields = [params.fields];
    }
    return findWithMeta(server, params)
      .then((response) => {
        return filterResponse(response, patterns, server)
      })
      .then((response) => {
        response.total = response.saved_objects.length;
        return response;
      })
      .catch((e) => {
        throw new Error(`Find route failed, error: ${e}`);
      });
  }
}
