#!/usr/bin/env bash

yay -S --answerclean No --answerdiff N --noconfirm --needed - < pkglist.txt

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clean up old install
rm -rf $HOME/.local/share/okpanel
rm -f $HOME/.local/bin/okpanel
rm -f $HOME/.local/bin/okpanel-share

# Install
mkdir -p $HOME/.local/share/okpanel
cp -r $SCRIPT_DIR/ags/. $HOME/.local/share/okpanel/

cp $SCRIPT_DIR/bin/okpanel $HOME/.local/bin/
cp $SCRIPT_DIR/bin/okpanel-share $HOME/.local/bin/
cp $SCRIPT_DIR/bin/screenshot $HOME/.local/bin/
