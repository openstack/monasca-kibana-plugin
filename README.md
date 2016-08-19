FTS-Keystone
=====

Keystone authentication support for Kibana 4.4.x

Installation
-----

Requires a working version of Kibana. The kibana configuration file (/opt/kibana/config/kibana.yml) should be updated
where keystone_port should be the keystone admin port (default: 35357) not the keystone member port (default: 5000):

```
fts-keystone.port: ${keystone_port}
fts-keystone.url: http://${keystone_host}
fts-keystone.enabled: True
fts-keystone.defaultTimeField: '@timestamp'
```

To install the fts-keystone plugin, first the latest release should be downloaded:

```
$ (cd /tmp; wget https://github.com/FujitsuEnablingSoftwareTechnologyGmbH/fts-keystone/releases/download/v0.0.1/fts-keystone-0.0.1.tar.gz; cd -)
```

Then installed using the Kibana plugin manager tool:

```
$ /opt/kibana/bin/kibana plugin --install fts-keystone --url file:///tmp/fts-keystone-0.0.1.tar.gz
Installing fts-keystone
Attempting to transfer from file:///tmp/fts-keystone-0.0.1.tar.gz
Transferring 7567007 bytes....................
Transfer complete
Extracting plugin archive
Extraction complete
Optimizing and caching browser bundles...
Plugin installation complete

$ /opt/kibana/bin/kibana plugin --list
fts-keystone
```
Now start/restart your Kibana server by running:

```
$ service kibana restart
```
