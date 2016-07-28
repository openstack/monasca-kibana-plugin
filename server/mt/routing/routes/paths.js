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

import Wreck from 'wreck';

import { SESSION_USER_KEY } from '../../../const';
import { getOpts } from '../_utils';
import kibanaIndex from '../../kibana/kibanaIndex';
import mapUri from '../_map_uri';

export default function (server, method, path) {
  const defaultKibanaIndex = defaultKibanaIndex;

  return {
    method : method,
    path   : path,
    config : {
      tags: ['elasticsearch', 'multitenancy'],
      auth: false
    },
    handler: handler
  };

  function handler(request, reply) {
    const session = request.yar._store;

    let url = mapUri(server, request).split('/');
    let kibanaIndexRequest = false;

    let indexPos = url.findIndex((item) => item === defaultKibanaIndex);
    if (indexPos > -1) {
      url[indexPos] = kibanaIndex(server, session[SESSION_USER_KEY]);
      kibanaIndexRequest = true;
    }
    url = url.join('/');

    const opts = getOpts(server, request, url);
    return Wreck.request(request.method, url, opts, (err, res) => {
      return Wreck.read(res, {json: true}, (err, body)=> {
        let newData = {};

        if (kibanaIndexRequest) {
          let tenantAwareIndex = Object.keys(body)[0];
          newData[defaultKibanaIndex] = body[tenantAwareIndex];
        } else {
          newData = body;
        }

        return reply(newData)
          .code(res.statusCode)
          .passThrough(!!opts.passThrough);
      });
    });
  }
}
