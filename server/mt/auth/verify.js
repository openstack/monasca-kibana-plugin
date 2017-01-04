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

import Boom from 'boom';

import {
  SESSION_PROJECTS_KEY,
  SESSION_USER_KEY,
  SESSION_TOKEN_CHANGED,
  TOKEN_CHANGED_VALUE,
  RELOAD_MARKUP
} from '../../const';

export default () => {
  return (request, reply) => {

    let session = request.yar;
    let userObj = session.get(SESSION_USER_KEY);
    let tokenChanged = session.get(SESSION_TOKEN_CHANGED);

    if (tokenChanged === TOKEN_CHANGED_VALUE) {
      request.log(['status', 'info', 'keystone'],
        'Detected that token has been changed, replaying the request'
      );
      session.clear(SESSION_TOKEN_CHANGED);
      return reply(RELOAD_MARKUP).type('text/html');
    } else if (userObj) {
      let expiresAt = new Date(userObj.expires_at).valueOf();
      let now = new Date().valueOf();
      let diff = now - expiresAt;

      if (diff >= 0) {
        session.reset();
        return reply(Boom.unauthorized('User token has expired'));
      } else {
        return reply.continue({
          credentials: userObj,
          artifacts  : {
            projects: session.get(SESSION_PROJECTS_KEY)
          },
          log        : {
            tags: 'keystone ok'
          }
        });
      }
    }

    // TODO(trebskit) should actually throw error here I guess
    return reply.continue();
  };
};
