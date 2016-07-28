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
 Original file can be found here => https://github.com/elastic/kibana/blob/4.4/src/plugins/elasticsearch/lib/create_agent.js
 */

import url from 'url';
import {memoize, size} from 'lodash';
import fs from 'fs';
import http from 'http';
import https from 'https';

const readFile = (file) => fs.readFileSync(file, 'utf8');

module.exports = memoize(function (server) {
  const config = server.config();
  const target = url.parse(config.get('elasticsearch.url'));

  if (!/^https/.test(target.protocol)) {
    return new http.Agent();
  }

  const agentOptions = {
    rejectUnauthorized: config.get('elasticsearch.ssl.verify')
  };

  if (size(config.get('elasticsearch.ssl.ca'))) {
    agentOptions.ca = config.get('elasticsearch.ssl.ca').map(readFile);
  }

  if (hasSSLEnabled()) {
    agentOptions.cert = readFile(config.get('elasticsearch.ssl.cert'));
    agentOptions.key = readFile(config.get('elasticsearch.ssl.key'));
  }

  return new https.Agent(agentOptions);

  function hasSSLEnabled() {
    return config.get('elasticsearch.ssl.cert')
      && config.get('elasticsearch.ssl.key');
  }

});

module.exports.cache = new Map();
