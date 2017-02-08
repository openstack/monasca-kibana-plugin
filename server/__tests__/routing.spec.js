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

describe('plugins/monasca-kibana-plugin', ()=> {
  describe('mt', ()=> {
    describe('routing', () => {

      const createProxy = sinon.spy();
      const serverLog = sinon.spy();

      let serverExt;
      let server;
      let reRoute;

      beforeEach(() => {
        serverExt = sinon.spy();
        server = {
          log: serverLog,
          ext: serverExt
        };
        reRoute = sinon.spy();
      });

      it('should load re-route logic',  (done) => {

        proxyRequire('../mt/routing', {
          './_create_proxy': createProxy,
          './_re_route'    : reRoute
        })(server).then(verify);

        function verify(route) {
          chai.expect(serverExt.calledOnce).to.be.ok;
          chai.expect(serverExt.calledWith('onRequest', reRoute));
          chai.expect(createProxy).to.be.eq(route);
          done();
        }

      });

    });
  });
});
