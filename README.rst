Monasca Kibana plugin
=====================

Keystone authentication support and multi-tenancy for Kibana 7.3.x

Build
-----

After installing Node JS 10.15.2 and yarn, do the following to
initiate Kibana development environment.

::

  git clone https://github.com/elastic/kibana --branch 7.3
  cd kibana

Clone the plugin to plugins/ inside the environment and run.

::

  yarn kbn bootstrap
  cd plugins/monasca-kibana-plugin
  yarn build

Installation
------------

Requires a working version of Kibana. The kibana configuration file
(/opt/kibana/config/kibana.yml) should be updated where keystone_port
should be the keystone admin port (default: 35357) not the keystone
member port (default: 5000):

::

   monasca-kibana-plugin.port: ${keystone_port}
   monasca-kibana-plugin.url: http://${keystone_host}
   monasca-kibana-plugin.enabled: True
   monasca-kibana-plugin.logs: True
   monasca-kibana-plugin.events: True
   monasca-kibana-plugin.defaultTimeField: '@timestamp'
   monasca-kibana-plugin.defaultEventsTimeField: '@timestamp'
   monasca-kibana-plugin.logsIndexPrefix: 'logs-<project_id>'
   monasca-kibana-plugin.eventsIndexPrefix: 'events-<project_id>'

Then install using the Kibana plugin manager tool:

::

   $ /opt/kibana/bin/kibana-plugin install file:///tmp/kibana/plugins/monasca-kibana-plugin/build/monasca-kibana-plugin-7.3.0.zip
   Installing monasca-kibana-plugin
   Attempting to transfer from file:///tmp/kibana/plugins/monasca-kibana-plugin/build/monasca-kibana-plugin-7.3.0.zip
   Transferring 7567007 bytes....................
   Transfer complete
   Extracting plugin archive
   Extraction complete
   Optimizing and caching browser bundles...
   Plugin installation complete

   $ /opt/kibana/bin/kibana-plugin list
   monasca-kibana-plugin@7.3.0

Now start/restart your Kibana server by running:

::

   $ service kibana restart


Valuable resources:
- Kibana plugin notes - https://github.com/nreese/kibana-plugin-notes
- Elastic forum - https://discuss.elastic.co
