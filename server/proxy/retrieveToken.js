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

const Boom = require('boom');

/** @module */
module.exports = retrieveToken;

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

const HEADER_NAME = 'x-auth-token';

function retrieveToken(server, request) {

  if (!request.session || request.session === null) {
    server.log(['keystone', 'error'], 'Session is not enabled');
    throw new Error('Session support is missing');
  }

  let tokenFromSession = request.session.get('keystone_token');
  let token = request.headers[HEADER_NAME];

  if (!token && !tokenFromSession) {
    server.log(['keystone', 'error'],
      'Token hasn\'t been located, looked in headers and session');
    return Boom.unauthorized(
      'You\'re not logged into the OpenStack. Please login via Horizon Dashboard'
    );
  }

  if (!token && tokenFromSession) {
    token = tokenFromSession;
    server.log(['keystone', 'debug'],
      'Token lookup status: Found token in session'
    );
  } else if ((token && !tokenFromSession) || (token !== tokenFromSession)) {
    server.log(['keystone', 'debug'],
      'Token lookup status: Token located in header/session or token changed'
    );
    request.session.set('keystone_token', token);
  }

  return token;
}
