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
import Wreck from 'wreck';

import { SESSION_USER_KEY } from '../../../const';
import { getOpts, parsePayload } from '../_utils';
import kibanaIndex from '../../kibana/kibanaIndex';
import mapUri from '../_map_uri';

export default function (server, method, path) {

  return {
    method : method,
    path   : path,
    config : {
      auth   : 'session',
      payload: {
        output: 'data',
        parse : false
      }
    },
    handler: handler
  };

  function handler(request, reply) {
    const url = mapUri(server, request);
    const session = request.yar._store;
    const payload = parsePayload(request);

    payload.docs.forEach((doc) => {
      doc._index = kibanaIndex(server, session[SESSION_USER_KEY]);
    });

    const opts = getOpts(server, request, url, payload);
    return Wreck.request(request.method, url, opts, (err, res) => {
      if (err) {
        server.log(
          ['status', 'error', 'keystone'],
          `Failed to request ${url}, error is ${err}`);
        return reply(Boom.wrap(err));
      }
      return Wreck.read(res, {json: true}, (err, body)=> {
        if (err) {
          server.log(
            ['status', 'error', 'keystone'],
            `Failed to read response from ${url}, error is ${err}`);
          return reply(Boom.wrap(err));
        }

        return reply(body)
          .code(res.statusCode)
          .passThrough(!!opts.passThrough);
      });
    });
  }
}
