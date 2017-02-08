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

const retrieveToken = require('../mt/auth/token');
const CONSTANTS = require('../const');
const RELOAD_SYMBOL = require('../mt/auth/reload');

describe('plugins/monasca-kibana-plugin', ()=> {
  describe('mt', ()=> {
    describe('auth', () => {
      describe('token', ()=> {

        let server;

        beforeEach(()=> {
          let configGet = sinon.stub();
          configGet.withArgs('monasca-kibana-plugin.cookie.name').returns('keystone');
          server = {
            log: sinon.stub(),
            config: function () {
              return {
                get: configGet
              };
            }
          };
        });

        it('should return isBoom if session not available', ()=> {
          let request = {
            state: {}
          };
          let errMsg = /Session support is missing/;

          chai.expect(()=> {
            retrieveToken(server, request);
          }).to.throw(errMsg);

          request = {
            yar: undefined,
            state: {}
          };
          chai.expect(()=> {
            retrieveToken(server, request);
          }).to.throw(errMsg);

          request = {
            session: null,
            state: {}
          };
          chai.expect(()=> {
            retrieveToken(server, request);
          }).to.throw(errMsg);
        });

        it('should Boom with unauthorized if token not in header or session', function () {
          let expectedMsg = 'You\'re not logged into the OpenStack. Please login via Horizon Dashboard';
          let request = {
            yar    : {
              'get': sinon
                .stub()
                .withArgs(CONSTANTS.SESSION_TOKEN_KEY)
                .returns(undefined),
              'reset': sinon.stub()
            },
            headers: {},
            state: {}
          };

          let result = retrieveToken(server, request);
          chai.expect(result.isBoom).to.be.true;
          chai.expect(result.output.payload.message).to.be.eq(expectedMsg);
          chai.expect(result.output.statusCode).to.be.eq(401);
        });

        it('should use session token if requested does not have it', () => {
          let expectedToken = 'SOME_RANDOM_TOKEN';
          let yar = {
            'reset': sinon.spy(),
            'set'  : sinon.spy(),
            'get'  : sinon.stub()
          };
          let request = {
            yar    : yar,
            headers: {},
            state: {}
          };
          let token;

          yar.get.returns(expectedToken);

          token = retrieveToken(server, request);
          chai.expect(token).not.to.be.undefined;
          chai.expect(token).to.be.eql(expectedToken);

          chai.expect(yar.get.callCount).to.be.eq(2);
          chai.expect(yar.set.calledOnce).not.to.be.ok;
          chai.expect(
            yar.set.calledWithExactly(CONSTANTS.SESSION_TOKEN_KEY, expectedToken)
          ).not.to.be.ok;
        });

        it('should set token in session if not there and request has it', () => {
          let expectedToken = 'SOME_RANDOM_TOKEN';
          let yar = {
            'reset': sinon.stub(),
            'set'  : sinon.spy(),
            'get'  : sinon.stub()
          };
          let request = {
            yar    : yar,
            headers: {
              'x-auth-token': expectedToken
            },
            state: {}
          };
          let token;

          yar.get
            .withArgs(CONSTANTS.SESSION_TOKEN_KEY)
            .onCall(0).returns(undefined)
            .onCall(1).returns(expectedToken);

          token = retrieveToken(server, request);
          chai.expect(token).to.not.be.undefined;
          chai.expect(token).to.be.eql(expectedToken);

          chai.expect(yar.get.callCount).to.be.eq(2);
          chai.expect(yar.set.calledOnce).to.be.ok;

          chai.expect(
            yar.set.calledWithExactly(
              CONSTANTS.SESSION_TOKEN_KEY,
              expectedToken
            )
          ).to.be.ok;
          chai.expect(
            yar.set.calledWithExactly(
              CONSTANTS.SESSION_TOKEN_CHANGED,
              CONSTANTS.TOKEN_CHANGED_VALUE
            )
          ).to.not.be.ok;
        });

        it('should update token in session if request\'s token is different', ()=> {
          let expectedToken = 'SOME_RANDOM_TOKEN';
          let oldToken = 'OLD_TOKEN';

          let headers = {
            'x-auth-token': expectedToken
          };
          let yar = {
            'reset': sinon.stub(),
            'get'  : sinon
              .stub()
              .withArgs(CONSTANTS.SESSION_TOKEN_KEY)
              .returns(oldToken),
            'set'  : sinon.spy()
          };
          let token;
          let request = {
            yar    : yar,
            headers: headers,
            state: {}
          };

          token = retrieveToken(server, request);
          chai.expect(token).to.not.be.undefined;
          chai.expect(token).to.be.eql(RELOAD_SYMBOL);

          chai.expect(yar.reset.calledTwice).to.be.ok;
          chai.expect(yar.get.calledOnce).to.be.ok;

          chai.expect(yar.set.callCount).to.be.eq(2);
          chai.expect(
            yar.set.calledWithExactly(
              CONSTANTS.SESSION_TOKEN_KEY,
              expectedToken
            )
          ).to.be.ok;
          chai.expect(
            yar.set.calledWithExactly(
              CONSTANTS.SESSION_TOKEN_CHANGED,
              CONSTANTS.TOKEN_CHANGED_VALUE
            )
          ).to.be.ok;

        });
      });
    });
  });
});
