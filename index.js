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

import session from './server/session';
import binding from './server/binding';
import healthCheck from './server/healthcheck';

export default (kibana) => {
  const COOKIE_PASSWORD_SIZE = 32;

  return new kibana.Plugin({
    require: ['elasticsearch'],
    config : config,
    init   : init
  });

  function config(Joi) {

    const cookie = Joi.object({
      name        : Joi.string()
        .default('keystone'),
      password    : Joi.string()
        .min(COOKIE_PASSWORD_SIZE)
        .default(require('crypto').randomBytes(COOKIE_PASSWORD_SIZE).toString('hex')),
      isSecure    : Joi.boolean()
        .default(process.env.NODE_ENV !== 'development'),
      ignoreErrors: Joi.boolean()
        .default(true),
      expiresIn   : Joi.number()
        .positive()
        .integer()
        .default(60 * 60 * 1000) // 1 hour
    }).default();

    return Joi.object({
      enabled: Joi.boolean().default(true),
      url    : Joi.string()
        .uri({scheme: ['http', 'https']})
        .required(),
      port   : Joi.number().required(),
      defaultTimeField: Joi.string().default('@timestamp'),
      cookie : cookie
    }).default();
  }

  function init(server) {
    server.log(['status', 'debug', 'keystone'], 'Initializing keystone plugin');
    binding(server).start();
    session(server).start();
    healthCheck(this, server).start();
    server.log(['status', 'debug', 'keystone'], 'Initialized keystone plugin');
  }

};
