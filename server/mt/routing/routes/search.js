/*
 * Copyright 2020 FUJITSU LIMITED
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

import Wreck from '@hapi/wreck';

import {getOpts, parsePayload} from '../_utils';
import mapUri from '../_map_uri';

export default function (server, method, path) {

  return {
    method: method,
    path: path,
    config: {
      auth: 'keystone-session',
    },
    handler: handler
  };

  async function handler(request, reply) {
    const url = mapUri(server, request);
    const payload = parsePayload(request);
    const opts = getOpts(server, request, url, payload);

    try {
      const rawResponse = await Wreck.request(request.method, url, opts);
      const body = await Wreck.read(rawResponse, opts);
      let response = JSON.parse(body.toString());

      return reply.response(response).code(rawResponse.statusCode)
        .passThrough(!!opts.passThrough);
    } catch (e) {
      throw new Error(e);
    }
  }
}
