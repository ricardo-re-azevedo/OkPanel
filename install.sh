#/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

#TODO make this copy instead of link
sudo mkdir -p /usr/share/OkPanel
sudo cp -r $SCRIPT_DIR/ags/ /usr/share/OkPanel/

sudo cp $SCRIPT_DIR/okpanel.sh /usr/bin/