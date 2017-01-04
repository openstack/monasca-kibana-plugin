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

/*
This file was copied and modified for this plugin needs.
Original file can be found here => https://github.com/elastic/kibana/blob/4.4/src/plugins/elasticsearch/lib/map_uri.js
 */

import querystring from 'querystring';

import { PREFIX } from './_utils';

export default (server, request) => {
  const config = server.config();
  const path = request.path.replace(`${PREFIX}/elasticsearch`, '');
  const query = querystring.stringify(request.query);

  let url = config.get('elasticsearch.url');

  if (path) {
    if (/\/$/.test(url)) {
      url = url.substring(0, url.length - 1);
    }
    url += path;
  }

  if (query) {
    url += '?' + query;
  }

  return url;
};
