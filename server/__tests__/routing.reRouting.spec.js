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
      describe('reRoute', () => {
        const prefix = '/test';
        const server = {
          log: sinon.spy()
        };

        it('should re-route ElasticSearch request', () => {
          const requestPath = '/elasticsearch/something/a/b/c';

          let request = {
            setUrl: sinon.spy()
          };
          let reply = {
            continue: sinon.spy()
          };
          let utils = {
            requestPath: sinon.stub().withArgs(request).returns(requestPath),
            isESRequest: sinon.stub().withArgs(request).returns(true)
          };

          proxyRequire('../mt/routing/_re_route', {
            '../../util': utils,
            './_utils'  : {
              PREFIX: prefix
            }
          })(server)(request, reply);

          chai.expect(request.setUrl.calledOnce).to.be.ok;
          chai.expect(request.setUrl.calledWith(`${prefix}${requestPath}`)).to.be.ok;
          chai.expect(reply.continue.calledOnce).to.be.ok;

        });

        it('should not re-route non-ElasticSearch request', () => {
          const requestPath = '/resources/cool.ico';

          let request = {
            setUrl: sinon.spy()
          };
          let reply = {
            continue: sinon.spy()
          };
          let utils = {
            requestPath: sinon.stub().withArgs(request).returns(requestPath),
            isESRequest: sinon.stub().withArgs(request).returns(false)
          };

          proxyRequire('../mt/routing/_re_route', {
            '../../util': utils,
            './_utils'  : {
              PREFIX: prefix
            }
          })(server)(request, reply);

          chai.expect(request.setUrl.calledOnce).to.not.be.ok;
          chai.expect(request.setUrl.calledWith(`${prefix}${requestPath}`)).to.not.be.ok;
          chai.expect(reply.continue.calledOnce).to.be.ok;

        });


      });
    });
  });
});
