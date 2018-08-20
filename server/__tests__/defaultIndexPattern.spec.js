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
    configGet.withArgs('monasca-kibana-plugin.defaultEventsTimeField').returns('@timestamp');
    configGet.withArgs('monasca-kibana-plugin.logsIndexPrefix').returns('logs-<project_id>');
    configGet.withArgs('monasca-kibana-plugin.eventsIndexPrefix').returns('events-<project_id>');

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
    it('should return false if default logs index-pattern does not exist', (done) => {
      let patternExists = require('../mt/kibana/defaultIndexPattern/_logs_exists').default;

      let exists = sinon.stub();
      exists.returns(Promise.resolve(false));
      server.plugins.elasticsearch.client.exists = exists;

      patternExists(server, indexName, userObj)
        .then((resp) => {
          chai.assert.equal(resp, false);
          chai.assert.isOk(exists.calledOnce);
        })
        .then(done);
    });

    it('should return true if default logs index-pattern already exists', (done) => {
      let patternExists = require('../mt/kibana/defaultIndexPattern/_logs_exists').default;

      let exists = sinon.stub();
      exists.returns(Promise.resolve(true));
      server.plugins.elasticsearch.client.exists = exists;

      patternExists(server, indexName, userObj)
        .then((resp) => {
          chai.assert.equal(resp, true);
          chai.assert.isOk(exists.calledOnce);
        })
        .then(done);
    });

    it('should return false if default events index-pattern does not exist', (done) => {
      let patternExists = require('../mt/kibana/defaultIndexPattern/_events_exists').default;

      let exists = sinon.stub();
      exists.returns(Promise.resolve(false));
      server.plugins.elasticsearch.client.exists = exists;

      patternExists(server, indexName, userObj)
        .then((resp) => {
          chai.assert.equal(resp, false);
          chai.assert.isOk(exists.calledOnce);
        })
        .then(done);
    });

    it('should return true if default events index-pattern already exists', (done) => {
      let patternExists = require('../mt/kibana/defaultIndexPattern/_events_exists').default;

      let exists = sinon.stub();
      exists.returns(Promise.resolve(true));
      server.plugins.elasticsearch.client.exists = exists;

      patternExists(server, indexName, userObj)
        .then((resp) => {
          chai.assert.equal(resp, true);
          chai.assert.isOk(exists.calledOnce);
        })
        .then(done);
    });
  });

  describe('defaultIndexPattern_create', () => {
    it('should create logs index-pattern with proper value', (done) => {
      let createPattern = require('../mt/kibana/defaultIndexPattern/_logs_create').default;

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
          chai.assert.equal(create.args[0][0].id, 'logs-abcdef*');
          chai.assert.equal(create.args[0][0].body.title, 'logs-abcdef*');
          chai.assert.equal(create.args[0][0].body.timeFieldName, '@timestamp');

          chai.assert.isOk(update.calledOnce);
          chai.assert.equal(update.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(update.args[0][0].type, 'config');
          chai.assert.equal(update.args[0][0].body.doc.defaultIndex, 'logs-abcdef*');

          chai.assert.isOk(refresh.called);
          chai.assert.equal(refresh.args[0][0].index, '.kibana-testdefaultindex');
        })
        .then(done);
    });

    it('should create events index-pattern with proper value', (done) => {
      let createPattern = require('../mt/kibana/defaultIndexPattern/_events_create').default;

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
          console.log(create.args[0][0].id);
          chai.assert.equal(create.args[0][0].id, 'events-abcdef*');
          chai.assert.equal(create.args[0][0].body.title, 'events-abcdef*');
          chai.assert.equal(create.args[0][0].body.timeFieldName, '@timestamp');

          chai.assert.isOk(update.calledOnce);
          chai.assert.equal(update.args[0][0].index, '.kibana-testdefaultindex');
          chai.assert.equal(update.args[0][0].type, 'config');
          chai.assert.equal(update.args[0][0].body.doc.defaultIndex, 'events-abcdef*');

          chai.assert.isOk(refresh.called);
          chai.assert.equal(refresh.args[0][0].index, '.kibana-testdefaultindex');
        })
        .then(done);
    });
  });

});
