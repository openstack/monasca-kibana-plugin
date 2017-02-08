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
  SESSION_TOKEN_KEY,
  SESSION_TOKEN_CHANGED,
  TOKEN_CHANGED_VALUE
} from '../../../const';
import RELOAD_SYMBOL from '../reload';

const HEADER_NAME = 'x-auth-token';

/**
 * Retrieves token from the response header using key <b>X-Keystone-Token</b>.
 * If token is found there following actions are taken:
 * - if token is not in session, it is set there
 * - if token is in session but it differs from the one in request's header, session's token is replaced with new one
 * If token is not found in request following actions are taken:
 * - if token is also not available in session, error is produced
 * - if token is available in session it is used
 *
 * @param {object} server server object
 * @param {object} request current request
 *
 * @returns {string} current token value
 */
module.exports = (server, request) => {

  if (!request.yar || request.yar === null) {
    server.log(['status', 'keystone', 'error'], 'Session is not enabled');
    throw new Error('Session support is missing');
  }

  // this is a workaround for problem with 'default' session:
  // when there is no session cookie present, then yar uses default session,
  // as a result many clients use the same session - security risk!
  const cookieName = server.config().get('monasca-kibana-plugin.cookie.name');
  if (!request.state[cookieName]) {
    request.yar.reset();
  }

  // DEV PURPOSE ONLY
  // request.yar.set(SESSION_TOKEN_KEY, 'a60e832483c34526a0c2bc3c6f8fa320');

  let tokenFromSession = request.yar.get(SESSION_TOKEN_KEY);
  let token = request.headers[HEADER_NAME];

  if (!token && !tokenFromSession) {
    server.log(['status', 'keystone', 'error'],
      'Token hasn\'t been located, looked in headers and session');
    return Boom.unauthorized(
      'You\'re not logged into the OpenStack. Please login via Horizon Dashboard'
    );
  }

  if (!token && tokenFromSession) {
    token = tokenFromSession;
    server.log(['status', 'debug', 'keystone'],
      'Token lookup status: Found token in session'
    );
  } else if ((token && !tokenFromSession) || (token !== tokenFromSession)) {
    server.log(['status', 'debug', 'keystone'],
      'Token lookup status: Token located in header/session or token changed'
    );

    if ((token !== tokenFromSession) && (token && tokenFromSession)) {
      server.log(['status', 'info', 'keystone'],
        'Reseting session because token has changed'
      );
      request.yar.reset();

      request.yar.set(SESSION_TOKEN_CHANGED, TOKEN_CHANGED_VALUE);
      request.yar.set(SESSION_TOKEN_KEY, token);

      return RELOAD_SYMBOL;
    }

    request.yar.set(SESSION_TOKEN_KEY, token);
  }

  return request.yar.get(SESSION_TOKEN_KEY);
};
