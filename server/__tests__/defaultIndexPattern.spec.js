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


const chai = require('chai');
const sinon = require('sinon');

describe('plugins/monasca-kibana-plugin', () => {
  const indexName = '.kibana-testdefaultindex';
  let server;
  let userObj;
  let configGet;


  beforeEach(function () {
    configGet = sinon.stub();
    configGet.withArgs('pkg.version').returns('4.4.0');
    configGet.withArgs('monasca-kibana-plugin.defaultTimeField').returns('@timestamp');

    server = {
      log   : sinon.stub(),
      config: function () {
        return {
          get: configGet
        };
      },
      plugins: {
        elasticsearch: {
          client: {
            indices: {}
          }
        }
      }
    };

    userObj = {
      project: {
        id: 'abcdef'
      }
    };

  });

  describe('defaultIndexPattern_exists', ()=> {
    it('should return false if default pattern does not exist', (done) => {
      let exists = require('../mt/kibana/defaultIndexPattern/_exists').default;

      let count = sinon.stub();
      count.returns(Promise.resolve({ count: 0 }));
      server.plugins.elasticsearch.client.count = count;

      exists(server, indexName)
        .then((resp) => {
          chai.assert.equal(resp, false);
          chai.assert.isOk(count.calledOnce);
          chai.assert.equal(count.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(count.args[0][0].type, 'index-pattern');
        })
        .then(done);
    });

    it('should return true if default pattern already exists', (done) => {
      let patternExists = require('../mt/kibana/defaultIndexPattern/_exists').default;

      let count = sinon.stub();
      count.returns(Promise.resolve({ count: 1 }));
      server.plugins.elasticsearch.client.count = count;

      patternExists(server, indexName)
        .then((resp) => {
          chai.assert.equal(resp, true);
          chai.assert.isOk(count.calledOnce);
          chai.assert.equal(count.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(count.args[0][0].type, 'index-pattern');
        })
        .then(done);
    });
  });

  describe('defaultIndexPattern_create', () => {
    it('should create pattern with proper value', (done) => {
      let createPattern = require('../mt/kibana/defaultIndexPattern/_create').default;

      let create = sinon.stub();
      create.returns(Promise.resolve(true));
      server.plugins.elasticsearch.client.create = create;

      let update = sinon.stub();
      update.returns(Promise.resolve(true));
      server.plugins.elasticsearch.client.update = update;

      let refresh = sinon.stub();
      refresh.returns(Promise.resolve(true));
      server.plugins.elasticsearch.client.indices.refresh = refresh;

      createPattern(server, indexName, userObj)
        .then((resp) => {
          chai.assert.isOk(create.calledOnce);
          chai.assert.equal(create.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(create.args[0][0].type, 'index-pattern');
          chai.assert.equal(create.args[0][0].id, 'abcdef*');
          chai.assert.equal(create.args[0][0].body.title, 'abcdef*');
          chai.assert.equal(create.args[0][0].body.timeFieldName, '@timestamp');

          chai.assert.isOk(update.calledOnce);
          chai.assert.equal(update.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(update.args[0][0].type, 'config');
          chai.assert.equal(update.args[0][0].body.doc.defaultIndex, 'abcdef*');

          chai.assert.isOk(refresh.called);
          chai.assert.equal(refresh.args[0][0].index, '.kibana-testdefaultindex');
        })
        .then(done);
    });
  });

});
