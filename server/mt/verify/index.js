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

import { SESSION_USER_KEY } from '../../const';
import util from '../../util';

module.exports = (server) => {

  return (request, reply) => {
    const session = request.yar._store;
    if (!(session && (SESSION_USER_KEY in session))) {
      server.log(['status', 'warning', 'keystone'], 'Session not yet available');
      return reply.continue();
    }

    let requestPath = util.requestPath(request);
    let requestMethod = request.method;

    if (util.isESRequest(request)) {
      let handler;
      if (isIndexPatternLookup()) {
        handler = require('./_verify_index_pattern');
      }
      if (handler) {
        return handler(request, reply);
      }
    }

    return reply.continue();

    function isIndexPatternLookup() {
      let regExp = /\/elasticsearch\/.*\/_mapping\/field\/.*/;
      return regExp.test(requestPath) && requestMethod.toLowerCase() === 'get';
    }

  };
};
