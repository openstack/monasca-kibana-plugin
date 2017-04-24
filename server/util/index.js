/*
 * Copyright 2016-2017 FUJITSU LIMITED
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

module.exports = {
  startsWith: startsWith,
  requestPath: getRequestPath,
  isESRequest: isESRequest,
  keystoneUrl: keystoneUrl
};

function keystoneUrl(config) {
  const urlKey = 'monasca-kibana-plugin.url';
  const portKey = 'monasca-kibana-plugin.port';
  const authUriKey = 'monasca-kibana-plugin.auth_uri';

  let url;

  if (config.get(urlKey) && config.get(portKey)) {
    url = `${config.get(urlKey)}:${config.get(portKey)}`;
  } else if (config.get(authUriKey)) {
    url = `${config.get(authUriKey)}`;
  } else {
    throw new Error(`Unexpected error, neither [${urlKey}, ${portKey}] nor ${authUriKey} found in config`);
  }

  return url;
}

function startsWith(str) {
  var prefixes = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < prefixes.length; ++i) {
    if (str.lastIndexOf(prefixes[i], 0) === 0) {
      return true;
    }
  }
  return false;
}

function getRequestPath(request) {
  return request.url.path;
}

function isESRequest(request) {
  return startsWith(getRequestPath(request), '/elasticsearch');
}
