#/bin/bash

mkdir -p $HOME/.config/OkPanel
rm -rf $HOME/.config/OkPanel/ags

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

#TODO make this copy instead of link
ln -s $SCRIPT_DIR/ags $HOME/.config/OkPanel