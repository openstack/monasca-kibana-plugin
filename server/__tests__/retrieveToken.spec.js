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

const retrieveToken = require('../proxy/retrieveToken');

describe('plugins/fts-keystone', ()=> {
  describe('proxy', ()=> {
    describe('retrieveToken', ()=> {

      let server;

      beforeEach(()=> {
        server = {
          log: sinon.stub()
        };
      });

      it('should return isBoom if session not available', ()=> {
        let request = {};
        let errMsg = /Session support is missing/;

        chai.expect(()=> {
          retrieveToken(server, request);
        }).to.throw(errMsg);

        request = {
          session: undefined
        };
        chai.expect(()=> {
          retrieveToken(server, request);
        }).to.throw(errMsg);

        request = {
          session: null
        };
        chai.expect(()=> {
          retrieveToken(server, request);
        }).to.throw(errMsg);
      });

      it('should Boom with unauthorized if token not in header or session', function () {
        let expectedMsg = 'You\'re not logged into the OpenStack. Please login via Horizon Dashboard';
        let request = {
          session: {
            'get': sinon
              .stub()
              .withArgs('keystone_token')
              .returns(undefined)
          },
          headers: {}
        };

        let result = retrieveToken(server, request);
        chai.expect(result.isBoom).to.be.true;
        chai.expect(result.output.payload.message).to.be.eq(expectedMsg);
        chai.expect(result.output.statusCode).to.be.eq(401);
      });

      it('should use session token if requested does not have it', () => {
        let expectedToken = 'SOME_RANDOM_TOKEN';
        let yar = {
          'set': sinon
            .spy(),
          'get': sinon
            .stub()
            .withArgs('keystone_token')
            .returns(expectedToken)
        };
        let request = {
          session: yar,
          headers: {}
        };
        let token;

        token = retrieveToken(server, request);
        chai.expect(token).not.to.be.undefined;
        chai.expect(token).to.be.eql(expectedToken);

        chai.expect(
          yar.get.calledOnce
        ).to.be.ok;
        chai.expect(
          yar.set.calledOnce
        ).not.to.be.ok;
        chai.expect(
          yar.set.calledWithExactly('keystone_token', expectedToken)
        ).not.to.be.ok;
      });

      it('should set token in session if not there and request has it', () => {
        let expectedToken = 'SOME_RANDOM_TOKEN';
        let yar = {
          'set': sinon
            .spy(),
          'get': sinon
            .stub()
            .withArgs('keystone_token')
            .returns(undefined)
        };
        let request = {
          session: yar,
          headers: {
            'x-auth-token': expectedToken
          }
        };
        let token;

        token = retrieveToken(server, request);
        chai.expect(token).to.not.be.undefined;
        chai.expect(token).to.be.eql(expectedToken);

        chai.expect(
          yar.get.calledOnce
        ).to.be.ok;
        chai.expect(
          yar.set.calledOnce
        ).to.be.ok;
        chai.expect(
          yar.set.calledWithExactly('keystone_token', expectedToken)
        ).to.be.ok;
      });

      it('should update token in session if request\'s token is different', ()=> {
        let expectedToken = 'SOME_RANDOM_TOKEN';
        let headers = {
          'x-auth-token': expectedToken
        };
        let yar = {
          'get': sinon
            .stub()
            .withArgs('keystone_token')
            .returns('SOME_OLD_TOKEN'),
          'set': sinon
            .spy()
        };
        let token;
        let request = {
          session: yar,
          headers: headers
        };

        token = retrieveToken(server, request);
        chai.expect(token).to.not.be.undefined;
        chai.expect(token).to.be.eql(expectedToken);

        chai.expect(
          yar.get.calledOnce
        ).to.be.ok;
        chai.expect(
          yar.set.calledOnce
        ).to.be.ok;
        chai.expect(
          yar.set.calledWithExactly('keystone_token', expectedToken)
        ).to.be.ok;
      });
    });
  });
});
