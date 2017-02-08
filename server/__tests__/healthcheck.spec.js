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
  describe('healthcheck', ()=> {

    const keystoneUrl = 'http://localhost';  // mocking http
    const keystonePort = 9000;

    let healthcheck; // placeholder for the require healthcheck

    let plugin;
    let configGet;
    let server;
    let clock;

    before(function () {
      clock = sinon.useFakeTimers();
    });
    after(function () {
      clock.restore();
    });

    beforeEach(function () {
      plugin = {
        name  : 'monasca-kibana-plugin',
        status: {
          red   : sinon.stub(),
          green : sinon.stub(),
          yellow: sinon.stub()
        }
      };

      configGet = sinon.stub();
      configGet.withArgs('monasca-kibana-plugin.url').returns(keystoneUrl);
      configGet.withArgs('monasca-kibana-plugin.port').returns(keystonePort);

      server = {
        log   : sinon.stub(),
        on    : sinon.stub(),
        config: function () {
          return {
            get: configGet
          };
        }
      };

    });

    it('should set status to green if keystone available', (done)=> {
      let expectedCode = 200;
      let expectedStatus = true;
      let healthcheck = proxyRequire('../healthcheck', {
        'http': {
          request: (_, callback)=> {
            return {
              end: () => {
                let res = {
                  statusCode: expectedCode
                };
                callback(res);
              },
              on : sinon.stub()
            };
          }
        }
      });
      let check = healthcheck(plugin, server);

      check
        .run()
        .then((status) => {
          chai.expect(expectedStatus).to.be.equal(status);
          chai.expect(plugin.status.green.calledWith('Ready')).to.be.ok;
        })
        .finally(done);

    });

    it('should set status to red if keystone not available', (done) => {
      let expectedCode = 500;
      let expectedStatus = false;
      let healthcheck = proxyRequire('../healthcheck', {
        'http': {
          request: (_, callback)=> {
            return {
              end: () => {
                let res = {
                  statusCode: expectedCode
                };
                callback(res);
              },
              on : sinon.stub()
            };
          }
        }
      });
      let check = healthcheck(plugin, server);

      check
        .run()
        .catch((status) => {
          chai.expect(expectedStatus).to.be.equal(status);
          chai.expect(plugin.status.red.calledWith('Unavailable')).to.be.ok;
        })
        .finally(done);

    });

    it('should set status to red if available but cannot communicate', (done)=> {
      let errorListener;
      let healthcheck = proxyRequire('../healthcheck', {
        'http': {
          request: ()=> {
            return {
              on : (_, listener)=> {
                errorListener = sinon.spy(listener);
              },
              end: ()=> {
                errorListener(new Error('test'));
              }
            };
          }
        }
      });
      let check = healthcheck(plugin, server);

      check
        .run()
        .catch((error)=> {
          let msg = 'Unavailable: Failed to communicate with Keystone';
          chai.expect(errorListener).to.be.ok;
          chai.expect(errorListener.calledOnce).to.be.ok;
          chai.expect(plugin.status.red.calledWith(msg)).to.be.ok;

          chai.expect(error.message).to.be.equal('test');
        })
        .done(done);

    });

    it('should run check in period `10000`', ()=> {
      let healthcheck = proxyRequire('../healthcheck', {
        'http': {
          request: sinon.stub().returns({
            end: sinon.stub(),
            on : sinon.stub()
          })
        }
      });

      let runChecks = 3;
      let timeout = 10000;

      let check = healthcheck(plugin, server);
      sinon.spy(check, 'run');

      // first call
      chai.expect(check.isRunning()).to.be.eq(false);
      check.start();
      validateFirstCall();

      // next calls
      for (let it = 0; it < runChecks; it++) {
        validateNextCallWithTick(it);
      }

      function validateFirstCall() {
        clock.tick(1); // first call is immediate
        chai.expect(check.run.calledOnce).to.be.ok;
        chai.expect(check.isRunning()).to.be.eq(true);
      }

      function validateNextCallWithTick(it) {
        // should be called once for the sake of first call
        chai.assert.equal(check.run.callCount, it + 1);

        // run check again
        check.start();

        // assert that tick did not kick in
        chai.assert.equal(check.run.callCount, it + 1);

        // kick it in
        clock.tick(timeout);

        // and we have another call
        chai.expect(check.run.callCount).to.be.eq(it + 2);
      }
    });

    it('should return false from stop if not run before', ()=> {
      let healthcheck = proxyRequire('../healthcheck', {
        'http': {
          request: sinon.stub().returns({
            end: sinon.stub(),
            on : sinon.stub()
          })
        }
      });

      let check = healthcheck(plugin, server);
      sinon.spy(check, 'run');

      chai.expect(check.stop()).to.be.eq(false);
      chai.expect(check.run.called).to.be.eq(false);
    });

  });
});
