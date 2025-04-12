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
