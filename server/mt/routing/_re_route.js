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

import utils from '../../util';
import { PREFIX } from './_utils';

module.exports = function reRoute(server) {
  return (request, reply) => {
    const requestPath = utils.requestPath(request);
    if (utils.isESRequest(request)) {
      server.log(['status', 'debug', 'keystone'], `Routing ${requestPath} onto ${PREFIX}${requestPath}`);
      request.setUrl(`${PREFIX}${requestPath}`);
    }
    return reply.continue();
  };
};
