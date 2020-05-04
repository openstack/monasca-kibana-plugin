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

import createAgent from './_create_agent';
import {bulkGetSavedObjects} from '../kibana/savedObjectsToolkit';

export const PREFIX = '/mt';

export function getOpts(server, request, url, payload) {

  let options = {
    headers: {},
    redirects: true,
    passThrough: true,
    xforward: true,
    search_timeout: '10s',
    localStatePassThrough: false,
    agent: createAgent(server),
  };
  let protocol = url.split(':', 1)[0];

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  if (options.passThrough) {
    options.headers = require('hoek').clone(request.headers);
    //delete options.headers.host;
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


function isAllowedSavedObject(element, patterns) {
  let references = [];
  switch (element.type) {
    case 'index-pattern':
      return patterns.includes(element.id);
    case 'config':
      return true;
    case 'visualization':
    case 'search':
      references = element.references.filter(element => patterns.includes(element.id));
      return references.length > 0;
    default:
      return false;
  }
}

// We have to retrieve savedObjects once again because some of the searches may not contain the references of references
// Dashboard would be allowed only if it references saved objects accessible to the user
function isAllowedDashboard(element, patterns) {

  const dashboardRefs = element.references.map((el) => {
    return {id: el.id, type: el.type};
  });

  return bulkGetSavedObjects(dashboardRefs)
    .then((response) => {
      let onlyAllowed = true;
      const references = response.saved_objects.map((el) => el.references)[0];
      references.forEach((hit) => {
        if (!patterns.includes(hit.id)) onlyAllowed = false;
      });
      return onlyAllowed;
    });
}

async function filterDashboards(object, patterns) {
  let dashboards = [];
  for (let element of object) {
    if (element.type === 'dashboard' && await isAllowedDashboard(element, patterns)) {
      dashboards.push(element);
    }
  }
  return dashboards;
}

// Dashboards have to be processed separately because it's references in saved_objects
// don't contain the references to index-pattern
// Dashboard is deemed allowed only if it contains allowed references only.
export async function filterResponse(data, patterns) {
  let savedObjects = data.saved_objects.filter(el => isAllowedSavedObject(el, patterns));
  let savedDashboards = await filterDashboards(data.saved_objects, patterns);

  data.saved_objects = savedObjects.concat(savedDashboards);
  return data;
}
