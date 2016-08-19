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
import Promise from 'bluebird';

import kibanaIndex from '../kibana';
import defaultIndexPattern from '../kibana/defaultIndexPattern';
import userProjects from '../projects';

import {
  SESSION_TOKEN_KEY,
  SESSION_USER_KEY
} from '../../const';

export default (server) => {

  return {
    tokenOk : tokenOk,
    tokenBad: tokenBad
  };

  function tokenOk(token, userObj, session) {
    session.reset();
    session.set(SESSION_TOKEN_KEY, token);
    session.set(SESSION_USER_KEY, userObj);

    return Promise
      .all([
        userProjects(server, session, userObj),
        kibanaIndex(server, userObj)
      ])
      .then(defaultIndexPattern(server, userObj))
      .then(() => {
        server.log(['status', 'info', 'keystone'], `User ${userObj.user.id} authorized with keystone`);
        return token;
      })
      .catch(err => {
        server.log(['status', 'info', 'keystone'],
          `Error caught in process of authorization, err was ${err}`);
        throw err;
      });
  }

  function tokenBad(token, error, session) {
    return new Promise((resolve)=> {
      server.log(['keystone', 'error'], `Failed to authenticate token ${token} with keystone, error is ${error.statusCode}.`);
      session.reset();

      let err;

      if (error.statusCode === 401) {
        err = Boom.forbidden('\You\'re not logged in as a user who\'s authorized to access log information');
      } else {
        err = Boom.internal(
          error.message || 'Unexpected error during Keystone communication',
          {},
          error.statusCode
        );
      }
      return resolve(err);
    });
  }

};
