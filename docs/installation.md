# Installation

## Arch

---

### AUR package

```
yay -S okpanel-git
```

---

### Manual

Install dependencies    
Hyprland is assumed to already be installed
```
yay -S aylurs-gtk-shell-git \
gvfs \
sox \
wf-recorder \
pipewire-pulse \
grim \
slurp \
networkmanager \
wireplumber \
bluez \
bluez-utils \
dart-sass \
upower \
brightnessctl \
ttf-jetbrains-mono-nerd \
libnotify
```

Checkout the git repository

```
git checkout git@github.com:JohnOberhauser/OkPanel.git
```

Then run the install.sh file
```
./install.sh
```

To uninstall, run the uninstall.sh file

```
./uninstall.sh
```

## Using without installation

You can run the project without installing if you wish.  This is good for dev work.  Just use the bins in the 
`bin` directory.  Note that if you have okpanel installed and try to run the bin from the checked out project,
the installed version will run.  So make sure you uninstall first.

```
git checkout git@github.com:JohnOberhauser/OkPanel.git
cd OkPanel/bin
./okpanel run
```
