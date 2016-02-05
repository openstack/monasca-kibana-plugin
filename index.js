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

module.exports = (kibana) => {

  const session = require('./server/session');
  const proxy = require('./server/proxy');
  const healthCheck = require('./server/healthcheck');

  return new kibana.Plugin({
    require: ['elasticsearch'],
    config : config,
    init   : init
  });

  function config(Joi) {

    const cookie = Joi.object({
      password    : Joi.string()
        .min(16)
        .default(require('crypto').randomBytes(16).toString('hex')),
      isSecure    : Joi.boolean()
        .default(false),
      ignoreErrors: Joi.boolean()
        .default(true),
      expiresIn   : Joi.number()
        .positive()
        .integer()
        .default(24 * 60 * 60 * 1000) // 1 day
    }).default();

    return Joi.object({
      enabled: Joi.boolean().default(true),
      url    : Joi.string()
        .uri({scheme: ['http', 'https']})
        .required(),
      port   : Joi.number().required(),
      cookie : cookie
    }).default();
  }

  function init(server) {
    session(server);
    proxy(server);
    healthCheck(this, server).start();
  }

};
