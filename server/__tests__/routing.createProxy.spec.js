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

describe('plugins/monasca-kibana-plugin', () => {
  describe('mt', () => {
    describe('routing', () => {
      describe('createProxy', () => {
        const kibanaIndex = '.kibana';
        const server = {
          log   : sinon.spy(),
          config: sinon.stub().returns({
            get: sinon.stub().withArgs('kibana.index').returns(kibanaIndex)
          })
        };

        let mgetHandler;
        let pathsHandler;
        let kibanaIndexHandler;
        let defaultHandler;

        beforeEach(() => {
          mgetHandler = sinon.stub().returns({});
          pathsHandler = sinon.stub().returns({});
          kibanaIndexHandler = sinon.stub().returns({});
          defaultHandler = sinon.stub().returns({});

          server.route = sinon.spy();
        });

        it('should load mget handler if that is the route',  () => {
          const route = '/_mget';
          const method = sinon.spy();

          proxyRequire('../mt/routing/_create_proxy', {
            './routes/mget'        : mgetHandler,
            './routes/paths'       : pathsHandler,
            './routes/kibana_index': kibanaIndexHandler,
            './routes/default'     : defaultHandler
          })(server, method, route);

          chai.expect(mgetHandler.calledOnce).to.be.ok;
          chai.expect(mgetHandler.calledWith(server, method, sinon.match.string)).to.be.ok;

          chai.expect(pathsHandler.calledOnce).to.not.be.ok;
          chai.expect(kibanaIndexHandler.calledOnce).to.not.be.ok;
          chai.expect(defaultHandler.calledOnce).to.not.be.ok;

          chai.expect(server.route.calledWith(sinon.match.object)).to.be.ok;
        });

        it('should load paths handler if that is the route',  () => {
          const route = '/{paths*}';
          const method = sinon.spy();

          proxyRequire('../mt/routing/_create_proxy', {
            './routes/mget'        : mgetHandler,
            './routes/paths'       : pathsHandler,
            './routes/kibana_index': kibanaIndexHandler,
            './routes/default'     : defaultHandler
          })(server, method, route);

          chai.expect(pathsHandler.calledOnce).to.be.ok;
          chai.expect(pathsHandler.calledWith(server, method, sinon.match.string)).to.be.ok;

          chai.expect(mgetHandler.calledOnce).to.not.be.ok;
          chai.expect(kibanaIndexHandler.calledOnce).to.not.be.ok;
          chai.expect(defaultHandler.calledOnce).to.not.be.ok;

          chai.expect(server.route.calledWith(sinon.match.object)).to.be.ok;
        });

        it('should load default handler if that is the route',  () => {
          const route = '/other';
          const method = sinon.spy();

          proxyRequire('../mt/routing/_create_proxy', {
            './routes/mget'        : mgetHandler,
            './routes/paths'       : pathsHandler,
            './routes/kibana_index': kibanaIndexHandler,
            './routes/default'     : defaultHandler
          })(server, method, route);

          chai.expect(defaultHandler.calledOnce).to.be.ok;
          chai.expect(defaultHandler.calledWith(server, method, sinon.match.string)).to.be.ok;

          chai.expect(mgetHandler.calledOnce).to.not.be.ok;
          chai.expect(kibanaIndexHandler.calledOnce).to.not.be.ok;
          chai.expect(pathsHandler.calledOnce).to.not.be.ok;

          chai.expect(server.route.calledWith(sinon.match.object)).to.be.ok;
        });

        it('should load kibana handler if that is the route',  () => {
          const route = `/${kibanaIndex}/{paths*}`;
          const method = sinon.spy();

          proxyRequire('../mt/routing/_create_proxy', {
            './routes/mget'        : mgetHandler,
            './routes/paths'       : pathsHandler,
            './routes/kibana_index': kibanaIndexHandler,
            './routes/default'     : defaultHandler
          })(server, method, route);

          chai.expect(kibanaIndexHandler.calledOnce).to.be.ok;
          chai.expect(kibanaIndexHandler.calledWith(server, method, sinon.match.string)).to.be.ok;

          chai.expect(mgetHandler.calledOnce).to.not.be.ok;
          chai.expect(defaultHandler.calledOnce).to.not.be.ok;
          chai.expect(pathsHandler.calledOnce).to.not.be.ok;

          chai.expect(server.route.calledWith(sinon.match.object)).to.be.ok;
        });

      });
    });
  });
});
