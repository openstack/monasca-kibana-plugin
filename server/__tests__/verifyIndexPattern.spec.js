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

const CONSTANTS = require('../const');
const verifyIndexPattern = require('../mt/verify/_verify_index_pattern');

describe('plugins/monasca-kibana-plugin', ()=> {
  describe('mt', ()=> {
    describe('verify', () => {
      describe('verify_index_pattern', () => {

        it('should reject * as index-pattern', () => {
          let indexPattern = '*';
          let request = {
            url: {
              path: `/a/${indexPattern}/`
            },
            yar: {
              _store: {}
            }
          };
          verifyIndexPattern(request, (result) => {
            chai.expect(result.isBoom)
              .to.be.true;
            chai.expect(result.output.payload.message)
              .to.be.eq('* as pattern is not supported at the moment');
            chai.expect(result.output.statusCode)
              .to.be.eq(422);
          });
        });

        it('should reject index-pattern if it does not match user`s projects', () => {
          let projects = [
            { id: 'project_1'}, { id: 'project_2' }, {id: 'project_3'}
          ];
          let indexPattern = 'test';
          let store = {};

          store[CONSTANTS.SESSION_PROJECTS_KEY]  = projects;

          let request = {
            url: {
              path: `/a/${indexPattern}/`
            },
            yar: {
              _store: store
            }
          };
          let reply = sinon.spy();

          verifyIndexPattern(request, (result) => {
            chai.expect(result.isBoom)
              .to.be.true;
            chai.expect(result.output.payload.message)
              .to.be.eq(`${indexPattern} do not match any project of current user`);
            chai.expect(result.output.statusCode)
              .to.be.eq(422);
          });
        });

        it('should accept index-pattern it it constaint project id', () => {
          let projects = [
            { id: 'project_1'}, { id: 'project_2' }, {id: 'project_3'}
          ];
          let indexPattern = projects[1].id;
          let store = {};

          store[CONSTANTS.SESSION_PROJECTS_KEY]  = projects;

          let request = {
            url: {
              path: `/a/${indexPattern}/`
            },
            yar: {
              _store: store
            }
          };
          let reply = {
            continue: sinon.spy()
          };

          verifyIndexPattern(request, reply);
          chai.expect(reply.continue.calledOnce).to.be.ok;
        });

      });
    });
  });
});
