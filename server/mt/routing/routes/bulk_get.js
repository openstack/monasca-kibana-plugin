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

import {bulkGetSavedObjects} from '../../kibana/savedObjectsToolkit';
import getAllowedPatterns from '../../kibana/defaultIndexPattern/_get_allowed_patterns'
import {SESSION_USER_KEY} from '../../../const';

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
    const patterns = getAllowedPatterns(server, userObj.project.id);
    const params = request.payload;

    if (params.type === 'index-pattern') {
      if (!patterns.includes(params.id)) {
        server.log(['error', 'api-bulk-get'], `Index-pattern ${params.id} is not allowed`);
        throw new Error(`Index-pattern ${params.id} is not allowed`);
      }
    }
    return bulkGetSavedObjects(params);
  }
}
