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

const sinon = require('sinon');
const chai = require('chai');
const proxyRequire = require('proxyquire');

const CONSTANTS = require('../const');

describe('plugins/monasca-kibana-plugin', ()=> {
  describe('mt', ()=> {
    describe('verify', () => {

      it('should skip if session not available',  () => {
        let server = {
          log: sinon.spy()
        };
        let request = {
          yar: {
            _store: undefined
          }
        };
        let reply  = {
          continue: sinon.spy()
        };

        require('../mt/verify')(server)(request, reply);
        chai.expect(reply.continue.calledOnce).to.be.ok;
      });

      it('should skip if session available but user object not found',  () => {
        let server = {
          log: sinon.spy()
        };
        let request = {
          yar: {
            _store: {
              '1': 1
            }
          }
        };
        let reply  = {
          continue: sinon.spy()
        };

        require('../mt/verify')(server)(request, reply);
        chai.expect(reply.continue.calledOnce).to.be.ok;
      });

      it('should skip non ElasticSearch requests', () => {
        let store = {};

        store[CONSTANTS.SESSION_USER_KEY] = {'id': 1};

        let server = {
          log: sinon.spy()
        };
        let request = {
          url : {
            path: '/some/other/path'
          },
          yar: {
            _store: store
          }
        };
        let reply  = {
          continue: sinon.spy()
        };

        require('../mt/verify')(server)(request, reply);
        chai.expect(reply.continue.calledOnce).to.be.ok;
      });

      it('should call verify indexPattern', () => {
        let store = {};
        let indexPattern = '*';

        store[CONSTANTS.SESSION_USER_KEY] = {'id': 1};

        let server = {
          log: sinon.spy()
        };
        let request = {
          method: 'GET',
          url : {
            path: `/elasticsearch/${indexPattern}/_mapping/field/`
          },
          yar: {
            _store: store
          }
        };
        let verifyIndexPattern = sinon.spy();

        proxyRequire('../mt/verify', {
          './_verify_index_pattern': verifyIndexPattern
        })(server)(request);

        chai.expect(verifyIndexPattern.calledOnce).to.be.ok;
      });

    });
  });
});
