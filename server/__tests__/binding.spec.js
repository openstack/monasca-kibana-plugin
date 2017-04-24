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
const proxyRequire = require('proxyquire');

describe('monasca-kibana-plugin', () => {
  describe('binding', () => {

    it('should expose tokens & users [url,port]', () => {

      let tokens = sinon.spy();
      let users = sinon.spy();
      let configGet = sinon.stub();

      configGet.withArgs('monasca-kibana-plugin.url').returns('http://localhost');
      configGet.withArgs('monasca-kibana-plugin.port').returns(5000);
      configGet.withArgs('monasca-kibana-plugin.auth_uri').returns(undefined);

      let server = {
        config: sinon.stub().returns({
          get: configGet
        }),
        log   : sinon.spy(),
        expose: sinon.spy()
      };

      proxyRequire('../binding', {
        'keystone-v3-client/lib/keystone/tokens': tokens,
        'keystone-v3-client/lib/keystone/users' : users
      })(server).start();

      chai.expect(configGet.callCount).to.be.eq(4);

      chai.expect(server.expose.callCount).to.be.eq(2);
      chai.expect(server.expose.calledWith('tokens', tokens));
      chai.expect(server.expose.calledWith('users', users));

    });

    it('should expose tokens & users [auth_uri]', () => {

      let tokens = sinon.spy();
      let users = sinon.spy();
      let configGet = sinon.stub();

      configGet.withArgs('monasca-kibana-plugin.url').returns(undefined);
      configGet.withArgs('monasca-kibana-plugin.port').returns(undefined);
      configGet.withArgs('monasca-kibana-plugin.auth_uri').returns('http://localhost/identity_admin');

      let server = {
        config: sinon.stub().returns({
          get: configGet
        }),
        log   : sinon.spy(),
        expose: sinon.spy()
      };

      proxyRequire('../binding', {
        'keystone-v3-client/lib/keystone/tokens': tokens,
        'keystone-v3-client/lib/keystone/users' : users
      })(server).start();

      chai.expect(configGet.callCount).to.be.eq(3);

      chai.expect(server.expose.callCount).to.be.eq(2);
      chai.expect(server.expose.calledWith('tokens', tokens));
      chai.expect(server.expose.calledWith('users', users));

    });
  });
});
