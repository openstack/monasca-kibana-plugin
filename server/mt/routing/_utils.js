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

import createAgent from './_create_agent';

export const PREFIX = '/mt';

export function getOpts(server, request, url, payload) {

  let options = {
    headers              : {},
    redirects            : true,
    passThrough          : true,
    xforward             : true,
    timeout              : 1000 * 60 * 3,
    localStatePassThrough: false,
    agent                : createAgent(server),
  };
  let protocol = url.split(':', 1)[0];

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  if (options.passThrough) {
    options.headers = require('hoek').clone(request.headers);
    delete options.headers.host;
    if (options.acceptEncoding === false) {
      delete options.headers['accept-encoding'];
    }
  }

  if (options.xforward &&
    request.info.remoteAddress &&
    request.info.remotePort) {

    options.headers['x-forwarded-for'] = (options.headers['x-forwarded-for'] ?
        options.headers['x-forwarded-for'] + ',' : '') + request.info.remoteAddress;
    options.headers['x-forwarded-port'] = (options.headers['x-forwarded-port'] ?
        options.headers['x-forwarded-port'] + ',' : '') + request.info.remotePort;
    options.headers['x-forwarded-proto'] = (options.headers['x-forwarded-proto'] ?
        options.headers['x-forwarded-proto'] + ',' : '') + protocol;
  }

  const contentType = request.headers['content-type'];
  if (contentType) {
    options.headers['content-type'] = contentType;
  }

  return options;
}

export function parsePayload(request) {
  let payload = request.payload;
  if (!payload || payload.length <= 0) {
    return {};
  }
  return JSON.parse(payload.toString('utf-8'));
}
