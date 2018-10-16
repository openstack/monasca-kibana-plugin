Monasca Kibana plugin
=====================

Keystone authentication support and multi-tenancy for Kibana 4.6.x

Build
-----

::

   npm install
   npm run package

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

   $ /opt/kibana/bin/kibana plugin --install monasca-kibana-plugin --url file:///tmp/monasca-kibana-plugin-0.0.1.tar.gz
   Installing monasca-kibana-plugin
   Attempting to transfer from file:///tmp/monasca-kibana-plugin-0.0.1.tar.gz
   Transferring 7567007 bytes....................
   Transfer complete
   Extracting plugin archive
   Extraction complete
   Optimizing and caching browser bundles...
   Plugin installation complete

   $ /opt/kibana/bin/kibana plugin --list
   monasca-kibana-plugin

Now start/restart your Kibana server by running:

::

   $ service kibana restart
