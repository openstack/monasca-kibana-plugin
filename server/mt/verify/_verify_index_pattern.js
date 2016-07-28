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

import { SESSION_PROJECTS_KEY } from '../../const';
import util from '../../util';

const INDEX_PATTER_POS = 2;

module.exports = (request, reply) => {
  const session = request.yar._store;
  const requestPath = util.requestPath(request);
  const splittedPath = requestPath.split('/');

  let pattern = splittedPath[INDEX_PATTER_POS];
  let projects = session[SESSION_PROJECTS_KEY];

  if ('*' === pattern) {
    return reply(Boom.badData('* as pattern is not supported at the moment'));
  } else if (projects.filter(filter).length === 0) {
    return reply(Boom.badData(`${pattern} do not match any project of current user`));
  }

  return reply.continue();

  function filter(project) {
    return new RegExp(`${project.id}.*`, 'gi').test(pattern);
  }
};
