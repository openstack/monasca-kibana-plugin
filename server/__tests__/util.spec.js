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

const sinon = require('sinon');
const chai = require('chai');
const util = require('../util');

describe('plugins/monasca-kibana-plugin', ()=> {
  describe('util', ()=> {

    const CHECK_STR = 'test.str';

    describe('startsWith', () => {
      it('should return true if starts with ok', ()=> {
        chai.expect(util.startsWith(CHECK_STR, 'test')).to.be.ok;
      });

      it('should return false if does not start with', ()=> {
        chai.expect(util.startsWith(CHECK_STR, 'str')).not.to.be.ok;
      });

      it('should return false if no prefixes supplied', ()=> {
        chai.expect(util.startsWith(CHECK_STR)).not.to.be.ok;
      });
    });

    describe('keystoneUrl', () => {
      const keystoneUrl = 'http://localhost';  // mocking http
      const keystonePort = 9000;
      const keystoneUri = `${keystoneUrl}:${keystonePort}`;

      let configGet;
      let config;

      beforeEach(() => {
        configGet = sinon.stub();
        config = {
          get: configGet
        };

      });

      it('should return url if url&port present', () => {
        configGet.withArgs('monasca-kibana-plugin.url').returns(keystoneUrl);
        configGet.withArgs('monasca-kibana-plugin.port').returns(keystonePort);
        configGet.withArgs('monasca-kibana-plugin.auth_uri').returns(undefined);

        chai.expect(util.keystoneUrl(config)).to.be.equal(keystoneUri);
        chai.expect(configGet.callCount).to.be.eq(4);
      });

      it('should return url if auth_uri present', () => {
        configGet.withArgs('monasca-kibana-plugin.url').returns(undefined);
        configGet.withArgs('monasca-kibana-plugin.port').returns(undefined);
        configGet.withArgs('monasca-kibana-plugin.auth_uri').returns(keystoneUri);

        chai.expect(util.keystoneUrl(config)).to.be.equal(keystoneUri);
        chai.expect(configGet.callCount).to.be.eq(3);
      });

      it('should error if neither present', () => {
        configGet.withArgs('monasca-kibana-plugin.url').returns(undefined);
        configGet.withArgs('monasca-kibana-plugin.port').returns(undefined);
        configGet.withArgs('monasca-kibana-plugin.auth_uri').returns(undefined);

        function fn() {
          util.keystoneUrl(config);
        }

        chai.expect(fn).to.throw(Error, /Unexpected error, neither/);

        chai.expect(configGet.callCount).to.be.eq(2);
      });

    });

  });
});
