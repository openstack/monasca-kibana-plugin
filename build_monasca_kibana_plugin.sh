#!/bin/bash

set -x  # Print each script step.
set -eo pipefail  # Exit the script if any statement returns error.

cd $KIBANA_PATH
git checkout -f 7.3
cp -avr /home/zuul/src/opendev.org/openstack/monasca-kibana-plugin $KIBANA_PATH/plugins

chmod -R 777 $KIBANA_PATH
chown -R zuul: $KIBANA_PATH

runuser -l zuul -c '
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash;
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh";
VERSION="10.15.2";
nvm install ${VERSION};
nvm use ${VERSION};
npm install -g yarn;
cd /home/zuul/src/github.com/elastic/kibana;
yarn kbn bootstrap; 
cd plugins/monasca-kibana-plugin
yarn build'