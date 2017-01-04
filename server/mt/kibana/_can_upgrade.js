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

import semver from 'semver';

const VERSION_REGEX = /(\d+\.\d+\.\d+)\-rc(\d+)/i;

export default (server, doc) => {
  const config = server.config();

  if (/beta|snapshot/i.test(doc._id)) {
    return false;
  }
  if (!doc._id) {
    return false;
  }
  if (doc._id === config.get('pkg.version')) {
    return false;
  }

  let packageRcRelease = Infinity;
  let rcRelease = Infinity;
  let packageVersion = config.get('pkg.version');
  let version = doc._id;
  let matches = doc._id.match(VERSION_REGEX);
  let packageMatches = config.get('pkg.version').match(VERSION_REGEX);

  if (matches) {
    version = matches[1];
    rcRelease = parseInt(matches[2], 10);
  }

  if (packageMatches) {
    packageVersion = packageMatches[1];
    packageRcRelease = parseInt(packageMatches[2], 10);
  }

  try {
    if (semver.gte(version, packageVersion) && rcRelease >= packageRcRelease) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};
