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

import {SESSION_USER_KEY} from '../../../const';
import {getOpts} from '../_utils';
import getAllowedPatterns from '../../kibana/defaultIndexPattern/_get_allowed_patterns';
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

    const session = request.yar;
    let url = mapUri(server, request).split('/');
    let project = session.get(SESSION_USER_KEY).project.id;

    let logsIndexPref = server.config().get('monasca-kibana-plugin.logsIndexPrefix');
    let eventsIndexPref = server.config().get('monasca-kibana-plugin.eventsIndexPrefix');
    logsIndexPref = logsIndexPref.replace('<project_id>', project);
    eventsIndexPref = eventsIndexPref.replace('<project_id>', project);

    server.log(['status', 'info', 'keystone'],
      `Allowing only these Index-Prefix ${logsIndexPref}, ${eventsIndexPref}`);

    url = url.join('/');

    const opts = getOpts(server, request, url, request.payload);
    const patterns = getAllowedPatterns(server, project);

    try {
      const rawResponse = await Wreck.request(request.method, url, opts);
      const body = await Wreck.read(rawResponse, opts);
      let response = JSON.parse(body.toString());

      if (response._shards.total > 0) {
        let indexHits = response.aggregations.indices.buckets;
        response.aggregations.indices.buckets =
          indexHits.filter(elem => patterns.includes(elem.key));
      }
      return reply.response(response).code(rawResponse.statusCode).passThrough(!!opts.passThrough);
    } catch (e) {
      throw new Error(e);
    }
  }
}
