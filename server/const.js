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

const NOW_TIME = (new Date().valueOf() / 1000);

export const SESSION_USER_KEY = `monasca-kibana-plugin-user-${NOW_TIME}`;
export const SESSION_TOKEN_KEY = `monasca-kibana-plugin-token-${NOW_TIME}`;
export const SESSION_PROJECTS_KEY = `monasca-kibana-plugin-projects-${NOW_TIME}`;
export const SESSION_TOKEN_CHANGED = `monasca-kibana-plugin-token-changed-${NOW_TIME}`;

export const TOKEN_CHANGED_VALUE = Symbol('token-changed');

export const RELOAD_MARKUP = `<html>
  <head><script type="text/javascript">window.location.reload();</script></head>
  <body>reloading...</body>
  </html>`;
