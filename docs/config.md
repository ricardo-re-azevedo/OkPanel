# Configure

Create a config file and place it in the config directory like so

```
~/.config/OkPanel/okpanel.json
```

## Config values

---

### Main

| Path                    | Required | Type                         | Description                                      |
|:------------------------|:---------|:-----------------------------|:-------------------------------------------------|
| gaps                    | False    | number                       | Gap size in pixels between elements.             |
| borderRadius            | False    | number                       | General border radius for panel elements.        |
| windowBorderRadius      | False    | number                       | Border radius for popup or window-like elements. |
| largeButtonBorderRadius | False    | number                       | Optional radius for large buttons.               |
| themeUpdateScript       | False    | string                       | Script to execute when changing the theme.       |
| wallpaperUpdateScript   | False    | string                       | Script to execute when changing the wallpaper.   |
| notificationsPosition   | False    | string - "left", "right"     | Where to display notifications.  Left or right   |
| horizontalBar           | False    | HorizontalBar - see below    | Horizontal bar configuration                     |
| verticalBar             | False    | VerticalBar - see below      | Vertical bar configuration                       |
| systemCommands          | True     | SystemCommands - see below   | System commands configuration                    |
| themes                  | False    | array[Theme - see below]     | A list of predefined themes                      |

### Horizontal Bar

| Path              | Required  | Type                                    | Description                                         |
|:------------------|:----------|:----------------------------------------|:----------------------------------------------------|
| leftWidgets       | False     | array[string - see bar widget values]   | Widgets to display on the left side of the panel.   |
| centerWidgets     | False     | array[string - see bar widget values]   | Widgets to display in the center of the panel.      |
| rightWidgets      | False     | array[string - see bar widget values]   | Widgets to display on the right side of the panel.  |

### Vertical Bar

| Path                | Required   | Type                                    | Description                                         |
|:--------------------|:-----------|:----------------------------------------|:----------------------------------------------------|
| topWidgets          | False      | array[string - see bar widget values]   | Widgets to display on the top side of the panel.    |
| centerWidgets       | False      | array[string - see bar widget values]   | Widgets to display in the center of the panel.      |
| bottomWidgets       | False      | array[string - see bar widget values]   | Widgets to display on the bottom side of the panel. |

### System Commands

| Path            | Required   | Type       | Description                                         |
|:----------------|:-----------|:-----------|:----------------------------------------------------|
| logout          | True       | string     | Command to log out the session.                     |
| lock            | True       | string     | Command to lock the screen.                         |
| restart         | True       | string     | Command to restart the system.                      |
| shutdown        | True       | string     | Command to shut down the system.                    |

### Theme

| Path         | Required  | Type                        | Description                                     |
|:-------------|:----------|:----------------------------|:------------------------------------------------|
| name         | True      | string                      | Name of the theme.                              |
| icon         | True      | char                        | Nerd font character to represent the theme.     |
| pixelOffset  | True      | number - between -10 and 10 | Pixel offset adjustment for the theme icon.     |
| wallpaperDir | True      | string                      | Directory containing wallpapers for this theme. |
| colors       | True      | Colors - see below          | Color palette for this theme.                   |

### Color

| Path             | Required  | Type       | Description                                         |
|:-----------------|:----------|:-----------|:----------------------------------------------------|
| background       | True      | string     | Background color.                                   |
| foreground       | True      | string     | Foreground/text color.                              |
| primary          | True      | string     | Primary color used for highlights.                  |
| buttonPrimary    | True      | string     | Primary button color.                               |
| sliderTrough     | True      | string     | Color for slider troughs.                           |
| hover            | True      | string     | Hover state color.                                  |
| warning          | True      | string     | Color for warning or alert states.                  |

### Bar widget values

| Widget String       | Description                                                            |
|---------------------|------------------------------------------------------------------------|
| menu                | Button that opens the system menu.                                     |
| workspaces          | Workspace indicators                                                   |
| clock               | Show the time.  Click to open the calendar.                            |
| recording_indicator | Shows if screen or audio recording is active.  Click to stop recording |
| audio_out           | Displays output volume level and mute toggle                           |
| audio_in            | Displays input (microphone) level and mute toggle                      |
| bluetooth           | Shows Bluetooth status                                                 |
| vpn_indicator       | Indicates active VPN connection                                        |
| network             | Displays current network status (Wi-Fi/Ethernet)                       |
| tray                | Displays the system tray button when available                         |
| battery             | Shows battery level and charging status                                |

---

## Example config

```json
{
  "gaps": 5,
  "borderRadius": 8,
  "windowBorderRadius": 8,
  "largeButtonBorderRadius": 16,
  "horizontalBar": {
    "leftWidgets": [
      "menu",
      "workspaces"
    ],
    "centerWidgets": [
      "clock"
    ],
    "rightWidgets": [
      "recording_indicator",
      "audio_out",
      "audio_in",
      "bluetooth",
      "vpn_indicator",
      "network",
      "battery",
      "tray"
    ]
  },
  "verticalBar": {
    "topWidgets": [
      "menu",
      "workspaces"
    ],
    "centerWidgets": [],
    "bottomWidgets": [
      "recording_indicator",
      "tray",
      "audio_out",
      "audio_in",
      "bluetooth",
      "vpn_indicator",
      "network",
      "battery",
      "clock"
    ]
  },
  "themeUpdateScript": "/home/john/workspace/scripts/setTheme.sh",
  "wallpaperUpdateScript": "/home/john/workspace/scripts/setWallpaper.sh",
  "systemCommands": {
    "logout": "uwsm stop",
    "lock": "uwsm app -- hyprlock",
    "restart": "systemctl reboot",
    "shutdown": "systemctl poweroff"
  },
  "themes": [
    {
      "name": "everforest",
      "icon": "󰌪",
      "pixelOffset": 1,
      "wallpaperDir": "/home/john/workspace/Pictures/wallpaper/everforest",
      "colors": {
        "background": "#1E2326",
        "foreground": "#D3C6AA",
        "primary": "#7A8478",
        "buttonPrimary": "#384B55",
        "sliderTrough": "#2E383C",
        "hover": "#2E383C",
        "warning": "#E67E80"
      }
    },
    {
      "name": "nord",
      "icon": "",
      "pixelOffset": 2,
      "wallpaperDir": "/home/john/workspace/Pictures/wallpaper/nord",
      "colors": {
        "background": "#2e3440",
        "foreground": "#d8dee9",
        "primary": "#81a1c1",
        "buttonPrimary": "#5e81ac",
        "sliderTrough": "#4c566a",
        "hover": "#4c566a",
        "warning": "#BF616A"
      }
    }
  ]
}
```

---

## Next up: Using the panel

<a href="../usage" class="md-button md-button--primary" style="margin-right: 1rem;">
    Usage
</a>
