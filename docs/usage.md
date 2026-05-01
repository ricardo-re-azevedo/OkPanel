# Usage

---

### Starting the panel

```
okpanel run
```

---

### Stopping the panel

```
okpanel quit
```

---

### Showing the app launcher

Bind this command to whatever keybind you want

```
okpanel launcher
```

---

### Taking a screenshot or recording the screen

```
okpanel screenshot
```

To stop screen recording, click the recording button that appears in your bar.

---

### Changing volume

If you want your system to make a clicking sound when adjusting volume, bind these.  It is not required though.

```
okpanel volume-up
okpanel volume-down
okpanel mute
```

---

### Changing theme from the command line

All colors are required to change a theme.  They should be in hex format, without the leading #

```
okpanel theme --background 000000 --foreground FFFFFF --primary 99AA00 --button 994466 --hover 444444 --slider 444444 --warning FF5544 --barBorder 000000 --alertBorder 000000 --windowBorder 000000
```

---

### Using the Hyprland share picker for [XDPH](https://wiki.hyprland.org/Hypr-Ecosystem/xdg-desktop-portal-hyprland/)

Create the file `xdph.conf` in your `~/.config/hypr/` directory and apply this config

```
screencopy {
    custom_picker_binary = okpanel-share
}
```
