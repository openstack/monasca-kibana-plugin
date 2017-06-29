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

import url from 'url';
import Promise from 'bluebird';

import util from '../util';

module.exports = function healthcheck(plugin, server) {
  const config = server.config();
  const keystoneUrl = util.keystoneUrl(config);
  const request = getRequest();
  const requestParams = getRequestParams();

  server.log(['keystone', 'healthcheck', 'debug'], `keystone url is ${keystoneUrl}`);

  let timeoutId;

  const service = {
    run      : check,
    start    : start,
    stop     : stop,
    isRunning: ()=> {
      return !!timeoutId;
    }
  };

  server.on('stop', stop);

  return service;

  function check() {
    return new Promise((resolve, reject)=> {
      const req = request(
      requestParams, (res)=> {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
          plugin.status.red('Unavailable');
          reject(false);
        } else {
          plugin.status.green('Ready');
          resolve(true);
        }
      });

      req.on('error', (error)=> {
        plugin.status.red('Unavailable: Failed to communicate with Keystone');
        server.log(['keystone', 'healthcheck', 'error'], `${error.message}`);
        reject(error);
      });

      req.end();
    });
  }

  function start() {
    scheduleCheck(service.stop() ? 10000 : 1);
  }

  function stop() {
    if (!timeoutId) {
      return false;
    }

    clearTimeout(timeoutId);
    timeoutId = undefined;
    return true;
  }

  function scheduleCheck(ms) {
    if (timeoutId) {
      return false;
    }

    const currentId = setTimeout(function () {
      service.run().finally(function () {
        if (timeoutId === currentId) {
          start();
        }
      });
    }, ms);
    timeoutId = currentId;

    return true;
  }

  function getHostname() {
    return url.parse(keystoneUrl).hostname;
  }

  function getPort() {
    return url.parse(keystoneUrl).port;
  }

  function getRequest() {
    let required;
    if (util.startsWith(keystoneUrl, 'https')) {
      required = require('https');
    } else {
      required = require('http');
    }
    return required.request;
  }

  function getRequestParams() {
    let params;

    params = {
      hostname: getHostname(),
      port    : getPort(),
      method  : 'GET'
    };
    if (util.startsWith(keystoneUrl, 'https')) {
      params.rejectUnauthorized = false;
    }

    return params;
  }

};
