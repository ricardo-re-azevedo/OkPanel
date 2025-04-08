# Features

## Bar

Bars can be configured with varius widgets.  The position of the bar can be changed through the system menu Look and Feel controls

<p style="display: flex; gap: 1rem;">
  <img src="../screenshots/features/bar/top.png" alt="Image 1" style="width: 50%;">
  <img src="../screenshots/features/bar/right.png" alt="Image 2" style="width: 50%;">
</p>

<p style="display: flex; gap: 1rem;">
  <img src="../screenshots/features/bar/left.png" alt="Image 3" style="width: 50%;">
  <img src="../screenshots/features/bar/bottom.png" alt="Image 3" style="width: 50%;">
</p>

## System Menu

### Network management

In the network section you can connect and disconnect from Wi-Fi and VPNs.  For a VPN connection to show up
it must be added to network manager.  Wireguard and OpenVPN connections will show.

![screenshot](screenshots/features/network.png)

### Bluetooth device management

Scan and connect to bluetooth devices.

![screenshot](screenshots/features/bluetooth.png)

### Audio controls

In the audio section you can adjust the volume sliders or click the icon button to mute.
You can swap the default input/output.

![screenshot](screenshots/features/audio.png)

### Look and Feel controls for theme, bar position, and wallpaper

Here you can switch between predefined themes.  The `themeUpdateScript` will be called
when switching themes.  The theme name you defined will be the first argument passed to the script.

You can switch the bar position here.

You can choose your wallpaper.  The wallpapers listed here are the ones found in the
directory defined in the theme's config.  JPG and PNGs in that directory will show up.
When selecting a wallpaper, the `wallpaperUpdateScript` will be called with the wallpaper
path as the argument.  That update script is in charge of setting the wallpaper with whatever
wallpaper program you use.

OkPanel will remember which wallpaper you last selected for each configured theme.  When
switching themes, the `wallpaperUpdateScript` will be called as well.

![screenshot](screenshots/features/lookandfeel.png)

### Mpris media controls

Mpris controls will show up when available.

![screenshot](screenshots/features/media.png)

### Notification popups and history

To enter "Do not disturb" mode, click the notification bell icon.

![screenshot](screenshots/features/notifications.png)

### Screenshot and screen recording tool

The `okpanel screenshot` command must be key-bound for this to show up.

When screen recording, you can set your encoding speed and CRF.  CRF will impact
quality and file size.  Choose a higher number (further down the list) for a lower
quality and smaller file size.

![screenshot](screenshots/features/screenshot.png)

### App launcher

The `okpanel launcher` command must be key-bound for this to show up.

![screenshot](screenshots/features/appLauncher.png)

### Calendar

Click the Clock widget in the bar to show the calendar.

![screenshot](screenshots/features/calendar.png)

### Volume and brightness alerts

These alerts will show automatically when changing volume or brightness.

![screenshot](screenshots/features/alerts.png)

### Screen share portal

The screen share portal only works with Hyprland's XDPH.  See the usage page for more info.

![screenshot](screenshots/features/portal.png)
