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
import Joi from 'joi';

import { SESSION_USER_KEY, RELOAD_MARKUP } from '../../const';
import lookupToken from './token';
import RELOAD from './reload';

const NOOP = ()=> {
};
const SCHEMA = {
  tokenOk : Joi.func().default(NOOP),
  tokenBad: Joi.func().default(NOOP)
};

export default (server, opts) => {
  Joi.assert(opts, SCHEMA, 'Invalid keystone auth options');

  const tokensApi = server.plugins['monasca-kibana-plugin'].tokens;
  const callbackOk = opts.tokenOk;
  const callbackBad = opts.tokenBad;

  return (request, reply) => {
    const token = lookupToken(server, request);
    const session = request.yar;

    let userObj = session.get(SESSION_USER_KEY);

    if (token.isBoom) {
      server.log(['status', 'debug', 'keystone'],
        'Received error object from token lookup'
      );
      return reply(token);
    } else if (token === RELOAD) {
      server.log(['status', 'debug', 'keystone'],
        'Received reload markup object from token lookup'
      );
      return reply(RELOAD_MARKUP).type('text/html');
    } else if (userObj && 'project' in userObj) {
      server.log(['status','info','keystone'], `${token} already authorized`);
      return reply.continue({credentials:token});
    }

    server.log(['status', 'debug', 'keystone'],
      'About to validate token with keystone'
    );

    return tokensApi
      .validate({
        headers: {
          'X-Auth-Token'   : token,
          'X-Subject-Token': token
        }
      })
      .then(
        (data) => {
          userObj = data.data.token;
          return callbackOk(token, userObj, session)
            .then(()=> {
              server.log(['status', 'debug', 'keystone'],
                `Auth process completed for user ${userObj.user.id}`);
              return reply.continue({credentials: token});
            });
        })
      .catch((error) => {
        return callbackBad(token, error, session)
          .then((err)=> {
            server.log(['status', 'error', 'keystone'], `Auth process did not complete for token ${token}`);
            server.log(['status', 'error', 'keystone'], `${err}`);
            return reply(Boom.wrap(err));
          });
      });
  };
};
