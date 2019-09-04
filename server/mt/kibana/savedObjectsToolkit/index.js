/*
 * Copyright 2020 FUJITSU LIMITED
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

let savedObjectsClient;

export function initClients(server) {
  const elasticsearchClient = server.plugins.elasticsearch.getCluster('admin').callWithInternalUser;
  const {SavedObjectsClient, getSavedObjectsRepository} = server.savedObjects;
  const internalRepository = getSavedObjectsRepository(elasticsearchClient);

  savedObjectsClient = new SavedObjectsClient(internalRepository);
}

export function findWithMeta(server, params) {
  const version = server.config().get('pkg.version');

  params.fields ? params.fields.push('title') : params.fields = ['title'];
  params.fields.push('visState');

  return find(params)
    .then((response) => {
      response.saved_objects.forEach(el => _createMetaForSavedObject(el, version));
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

export async function bulkGetSavedObjects(params) {
  return await savedObjectsClient.bulkGet(params)
    .catch((err) => {
      throw new Error(err);
    });
}


function _createMetaForSavedObject(object, version) {
  const inAppPrefix = '/app/kibana#';
  const managementPrefix = '/management/kibana';
  switch (object.type) {
    case 'config':
      object.meta = {
        title: `Advanced Settings [${version}]`,
        inAppUrl: {
          path: `${inAppPrefix}${managementPrefix}/settings`,
          uiCapabilitiesPath: "advancedSettings.show"
        }
      };
      break;
    case 'index-pattern':
      object.meta = {
        icon: 'indexPatternApp',
        title: object.attributes.title,
        editUrl: `${managementPrefix}/index_patterns/${object.title}`,
        inAppUrl: {
          path: `${inAppPrefix}${managementPrefix}/index_patterns/${object.id}`,
          uiCapabilitiesPath: "management.kibana.index_patterns"
        }
      };
      break;
    case 'search':
      object.meta = {
        icon: 'search',
        title: object.attributes.title,
        editUrl: `${managementPrefix}/objects/savedSearches/${object.id}`,
        inAppUrl: {
          path: `${inAppPrefix}/discover/${object.id}`,
          uiCapabilitiesPath: "discover.show"
        }
      };
      break;
    case 'visualization':
      object.meta = {
        icon: 'visualizeApp',
        title: object.attributes.title,
        editUrl: `${managementPrefix}/objects/savedVisualizations/${object.id}`,
        inAppUrl: {
          path: `${inAppPrefix}/visualize/edit/${object.id}`,
          uiCapabilitiesPath: "visualize.show"
        }
      };
      break;
    case 'dashboard':
      object.meta = {
        icon: 'dashboardApp',
        title: object.attributes.title,
        editUrl: `${managementPrefix}/objects/savedDashboards/${object.id}`,
        inAppUrl: {
          path: `${inAppPrefix}/dashboard/${object.id}`,
          uiCapabilitiesPath: "dashboard.show"
        }
      };
      break;
    default:
      throw new Error(`Unknown saved object type ${object.type}`);
  }
  return object;
}

export async function createSavedObject(type, options, params) {
  return await savedObjectsClient.create(type, options, params)
    .catch((err) => {
      throw new Error(`Unable to create ${type} ${options}, error is ${err}`);
    });
}

export async function find(params) {
  return await savedObjectsClient.find(params)
    .catch((err) => {
      throw new Error(`Can't perform search ${params}, error is: ${err}`);
    });
}

export async function updateConfig(type, version, changes) {
  return await savedObjectsClient.update(type, version, changes)
    .catch((err) => {
      throw new Error(`Can't update ${type} with ${changes}, error is: ${err}`);
    });
}

export async function deleteSavedObject(type, id) {
  return await savedObjectsClient.delete(type, id)
    .catch((err) => {
      throw new Error(`Can't delete ${type} ${id}, error is: ${err}`);
    });
}
