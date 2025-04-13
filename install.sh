#/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clean up old install
sudo rm -rf $HOME/.local/share/okpanel
sudo rm $HOME/.local/bin/okpanel
sudo rm $HOME/.local/bin/okpanel-share

# Install
sudo mkdir -p $HOME/.local/share/okpanel
sudo cp -r $SCRIPT_DIR/ags/ $HOME/.local/share/okpanel/

sudo cp $SCRIPT_DIR/bin/okpanel $HOME/.local/bin/
sudo cp $SCRIPT_DIR/bin/okpanel-share $HOME/.local/bin/
