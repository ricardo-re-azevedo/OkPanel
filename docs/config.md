# Configure

Create a config file and place it in the config directory like so

```
~/.config/OkPanel/okpanel.json
```

## Config values

---

### Main

| Name                    | Description                                      | Required | Type                       | Default                            |
|:------------------------|:-------------------------------------------------|:---------|:---------------------------|------------------------------------|
| gaps                    | Gap size in pixels between elements.             | False    | number                     | 5                                  |
| borderRadius            | General border radius for panel elements.        | False    | number                     | 8                                  |
| windowBorderRadius      | Border radius for popup or window-like elements. | False    | number                     | 8                                  |
| largeButtonBorderRadius | Optional radius for large buttons.               | False    | number                     | 16                                 |
| themeUpdateScript       | Script to execute when changing the theme.       | False    | string                     | undefined                          |
| wallpaperUpdateScript   | Script to execute when changing the wallpaper.   | False    | string                     | undefined                          |
| notificationsPosition   | Where to display notifications.  Left or right   | False    | string : "left", "right"   | "right"                            |
| horizontalBar           | Horizontal bar configuration                     | False    | HorizontalBar : see below  | see below                          |
| verticalBar             | Vertical bar configuration                       | False    | VerticalBar : see below    | see below                          |
| systemMenu              | System menu configuration                        | False    | SystemMenu : see below     | see below                          |
| systemCommands          | System commands configuration                    | True     | SystemCommands : see below | required                           |
| themes                  | A list of predefined themes                      | False    | array[Theme : see below]   | defaults to a single premade theme |

### Horizontal Bar

| Name          | Description                                       | Required | Type                                  | Default                                                                                                      |
|:--------------|:--------------------------------------------------|:---------|:--------------------------------------|--------------------------------------------------------------------------------------------------------------|
| leftWidgets   | Widgets to display on the left side of the panel  | False    | array[string : see bar widget values] | ["menu", "workspaces"]                                                                                       |
| centerWidgets | Widgets to display in the center of the panel     | False    | array[string : see bar widget values] | ["clock"]                                                                                                    |
| rightWidgets  | Widgets to display on the right side of the panel | False    | array[string : see bar widget values] | ["recording_indicator", "tray", "audio_out", "audio_in", "bluetooth", "vpn_indicator", "network", "battery"] |
| expanded      | Expand the bar to the edges of the screen         | False    | boolean                               | true                                                                                                         |
| splitSections | Split each section visually                       | False    | boolean                               | false                                                                                                        |
| minimumWidth  | The minimum width of the bar if not expanded      | False    | number                                | 800                                                                                                          |

### Vertical Bar

| Name          | Description                                         | Required  | Type                                  | Default                                                                                                               |
|:--------------|:----------------------------------------------------|:----------|:--------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| topWidgets    | Widgets to display on the top side of the panel.    | False     | array[string : see bar widget values] | ["menu", "workspaces"]                                                                                                |
| centerWidgets | Widgets to display in the center of the panel.      | False     | array[string : see bar widget values] | []                                                                                                                    |
| bottomWidgets | Widgets to display on the bottom side of the panel. | False     | array[string : see bar widget values] | ["recording_indicator", "tray", "audio_out", "audio_in", "bluetooth", "vpn_indicator", "network", "battery", "clock"] |
| expanded      | Expand the bar to the edges of the screen           | False     | boolean                               | true                                                                                                                  |
| splitSections | Split each section visually                         | False     | boolean                               | false                                                                                                                 |
| minimumHeight | The minimum height of the bar if not expanded       | False     | number                                | 600                                                                                                                   |

### System Menu

| Name              | Description                                | Required | Type    | Default |
|:------------------|:-------------------------------------------|:---------|:--------|---------|
| enableMprisWidget | Show the Mpris music widget when available | False    | boolean | true    |
| enableVpnControls | Show VPN controls in the network section   | False    | boolean | true    |


### System Commands

| Name     | Description                                         | Required   | Type       |
|:---------|:----------------------------------------------------|:-----------|:-----------|
| logout   | Command to log out the session.                     | True       | string     |
| lock     | Command to lock the screen.                         | True       | string     |
| restart  | Command to restart the system.                      | True       | string     |
| shutdown | Command to shut down the system.                    | True       | string     |

### Theme

| Name         | Description                                     | Required  | Type                        |
|:-------------|:------------------------------------------------|:----------|:----------------------------|
| name         | Name of the theme.                              | True      | string                      |
| icon         | Nerd font character to represent the theme.     | True      | char                        |
| pixelOffset  | Pixel offset adjustment for the theme icon.     | True      | number : between -10 and 10 |
| wallpaperDir | Directory containing wallpapers for this theme. | True      | string                      |
| colors       | Color palette for this theme.                   | True      | [Color : see below]         |

### Color

| Name          | Description                                         | Required  | Type       |
|:--------------|:----------------------------------------------------|:----------|:-----------|
| background    | Background color.                                   | True      | string     |
| foreground    | Foreground/text color.                              | True      | string     |
| primary       | Primary color used for highlights.                  | True      | string     |
| buttonPrimary | Primary button color.                               | True      | string     |
| sliderTrough  | Color for slider troughs.                           | True      | string     |
| hover         | Hover state color.                                  | True      | string     |
| warning       | Color for warning or alert states.                  | True      | string     |

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
