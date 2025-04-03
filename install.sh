#/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clean up old install
sudo rm -rf /usr/share/OkPanel
sudo rm /usr/bin/okpanel
sudo rm /usr/bin/okpanelShare

# Install
sudo mkdir -p /usr/share/OkPanel
sudo cp -r $SCRIPT_DIR/ags/ /usr/share/OkPanel/

sudo cp $SCRIPT_DIR/bin/okpanel /usr/bin/
sudo cp $SCRIPT_DIR/bin/okpanelShare /usr/bin/