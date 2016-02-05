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

const proxyRequire = require('proxyquire');
const Promise = require('bluebird');
const sinon = require('sinon');
const chai = require('chai');

describe('plugins/fts-keystone', ()=> {
  describe('proxy', ()=> {
    describe('proxy_check', ()=> {

      const keystoneUrl = 'http://localhost';  // mocking http
      const keystonePort = 9000;

      let server;
      let configGet;

      beforeEach(()=> {
        configGet = sinon.stub();
        configGet.withArgs('fts-keystone.url').returns(keystoneUrl);
        configGet.withArgs('fts-keystone.port').returns(keystonePort);

        server = {
          log   : sinon.stub(),
          config: function () {
            return {
              get: configGet
            };
          }
        };
      });

      it('should do nothing if not /elasticsearch call', ()=> {
        let checkSpy = sinon.spy();
        let retrieveTokenSpy = sinon.spy();
        let proxy = proxyRequire('../proxy/proxy', {
          'keystone-v3-client/lib/keystone/tokens': () => {
            return {check: checkSpy};
          },
          './retrieveToken'                       : retrieveTokenSpy
        })(server);
        let request = {
          url: {
            path: '/bundles/styles.css'
          }
        };
        let reply = {
          'continue': sinon.spy()
        };

        proxy(request, reply);

        chai.expect(reply.continue.calledOnce).to.be.ok;
        chai.expect(checkSpy.called).to.not.be.ok;
        chai.expect(retrieveTokenSpy.called).to.not.be.ok;
      });

      it('should authenticate with keystone', (done)=> {

        let token = '1234567890';
        let checkStub = sinon.stub().returns(Promise.resolve());
        let retrieveTokenStub = sinon.stub().returns(token);

        let proxy = proxyRequire('../proxy/proxy', {
          'keystone-v3-client/lib/keystone/tokens': () => {
            return {check: checkStub};
          },
          './retrieveToken'                       : retrieveTokenStub
        })(server);
        let request = {
          session: {
            'get'  : sinon.stub(),
            'set'  : sinon.stub()
          },
          url    : {
            path: '/elasticsearch/.kibana'
          }
        };

        let reply = {
          'continue': sinon.spy()
        };
        let replyCall;

        proxy(request, reply)
          .finally(verifyStubs)
          .done(done);

        function verifyStubs() {
          chai.expect(reply.continue.calledOnce).to.be.ok;
          replyCall = reply.continue.firstCall.args;

          chai.expect(replyCall).to.be.empty;

          // other stubs
          chai.expect(checkStub.calledOnce).to.be.ok;
          chai.expect(checkStub.calledWithExactly({
            headers: {
              'X-Auth-Token'   : token,
              'X-Subject-Token': token
            }
          })).to.be.ok;

          chai.expect(retrieveTokenStub.calledOnce).to.be.ok;
          chai.expect(retrieveTokenStub.calledWithExactly(server, request))
            .to.be.ok;
        }
      });

      it('should not authenticate with keystone', (done)=> {
        let token = '1234567890';
        let checkStub = sinon.stub().returns(Promise.reject({
          statusCode: 666
        }));
        let retrieveTokenStub = sinon.stub().returns(token);
        let proxy = proxyRequire('../proxy/proxy', {
          'keystone-v3-client/lib/keystone/tokens': () => {
            return {check: checkStub};
          },
          './retrieveToken'                       : retrieveTokenStub
        })(server);
        let request = {
          session: {
            'get'  : sinon.stub(),
            'set'  : sinon.stub()
          },
          url    : {
            path: '/elasticsearch/.kibana'
          }
        };
        let reply = sinon.spy();
        let replyCall;

        proxy(request, reply)
          .finally(verifyStubs)
          .done(done);

        function verifyStubs() {
          chai.expect(reply.calledOnce).to.be.ok;
          replyCall = reply.firstCall.args[0];

          chai.expect(replyCall.isBoom).to.be.ok;

          // other stubs
          chai.expect(checkStub.calledOnce).to.be.ok;
          chai.expect(checkStub.calledWithExactly({
            headers: {
              'X-Auth-Token'   : token,
              'X-Subject-Token': token
            }
          })).to.be.ok;

          chai.expect(retrieveTokenStub.calledOnce).to.be.ok;
          chai.expect(retrieveTokenStub.calledWithExactly(server, request))
            .to.be.ok;
        }

      });

    });
  });
});
