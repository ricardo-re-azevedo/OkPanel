# 🛠 OkPanel Configuration Reference

_This file is auto-generated. Do not edit manually._


| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `buttonBorderRadius` | number | `8` |  | Border radius (px) used by regular buttons. |
| `largeButtonBorderRadius` | number | `16` |  | Border radius (px) used by large buttons. |
| `themeUpdateScript` | string |  |  | Absolute path to the script run when a theme changes. |
| `wallpaperUpdateScript` | string |  |  | Absolute path to the script run when the wallpaper changes. |
| `mainMonitor` | number | `0` |  | Index of the primary monitor (0‑based as reported by Hyprland). |
| `scrimColor` | string | `#00000001` |  | CSS/GTK‑style color used for translucent overlays (RGBA hex). If set to #00000000 scrim will be disabled. |
| `font` | string | `JetBrainsMono NF` |  | Default font family used across the panel widgets. |
| `windows` | object |  |  | Global window styling defaults. |
| `windows.gaps` | number | `5` |  | Gap (px) between tiled windows. |
| `windows.borderRadius` | number | `8` |  | Corner radius (px) for client‑side decorations. |
| `windows.borderWidth` | number | `2` |  | Window border width (px). |
| `notifications` | object |  |  | Notification pop‑up behaviour. |
| `notifications.position` | enum | `right` |  | Screen edge where notification bubbles appear. |
| `notifications.respectExclusive` | boolean | `true` |  | Whether to avoid overlaying exclusive zones declared by widgets. |
| `horizontalBar` | object |  |  | Configuration for a horizontal (top/bottom) bar layout. |
| `horizontalBar.leftWidgets[]` | array<enum> | `menu,workspaces` |  | Widgets anchored left. |
| ↳ Allowed values for `horizontalBar.leftWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `horizontalBar.centerWidgets[]` | array<enum> | `clock` |  | Widgets centered. |
| ↳ Allowed values for `horizontalBar.centerWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `horizontalBar.rightWidgets[]` | array<enum> | `recording_indicator,tray,audio_out,audio_in,bluetooth,vpn_indicator,network,battery` |  | Widgets anchored right. |
| ↳ Allowed values for `horizontalBar.rightWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `horizontalBar.expanded` | boolean | `true` |  | If true, the bar stretches to the full monitor width. |
| `horizontalBar.splitSections` | boolean | `false` |  | If true, left/center/right widgets are rendered separately with padding. |
| `horizontalBar.sectionPadding` | number | `0` |  | Padding (px) around each section when splitSections = true. |
| `horizontalBar.minimumWidth` | number | `800` |  | Minimum bar width if not expanded. |
| `horizontalBar.widgetSpacing` | number | `0` |  | Spacing (px) between widgets inside the bar. |
| `verticalBar` | object |  |  | Configuration for a vertical (left/right) bar layout. |
| `verticalBar.topWidgets[]` | array<enum> | `menu,workspaces` |  | Widgets anchored at the top. |
| ↳ Allowed values for `verticalBar.topWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `verticalBar.centerWidgets[]` | array<enum> | `` |  | Widgets centered vertically. |
| ↳ Allowed values for `verticalBar.centerWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `verticalBar.bottomWidgets[]` | array<enum> | `recording_indicator,tray,audio_out,audio_in,bluetooth,vpn_indicator,network,battery,clock` |  | Widgets anchored at the bottom. |
| ↳ Allowed values for `verticalBar.bottomWidgets[]` |  |  |  | `menu`, `workspaces`, `clock`, `audio_out`, `audio_in`, `bluetooth`, `network`, `recording_indicator`, `vpn_indicator`, `battery`, `tray`, `integrated_tray`, `app_launcher`, `screenshot` |
| `verticalBar.expanded` | boolean | `true` |  | If true, bar stretches the full monitor height. |
| `verticalBar.splitSections` | boolean | `false` |  | If true, widgets are grouped with spacing between sections. |
| `verticalBar.sectionPadding` | number | `0` |  | Padding (px) around each section when splitSections = true. |
| `verticalBar.minimumHeight` | number | `600` |  | Minimum bar height before collapsing behaviour is applied. |
| `verticalBar.widgetSpacing` | number | `0` |  | Spacing (px) between widgets inside the bar. |
| `systemMenu` | object |  |  | Extra controls exposed by the menu button. |
| `systemMenu.menuButtonIcon` | string | `` |  | Icon shown on the menu button (ex: Nerd Font glyph). |
| `systemMenu.enableMprisWidget` | boolean | `true` |  | Show the MPRIS now‑playing widget in the menu. |
| `systemMenu.enableVpnControls` | boolean | `true` |  | Show quick‑toggle VPN controls inside the menu. |
| `systemCommands` | object |  | ✅ | Shell commands executed by power options. |
| `systemCommands.logout` | string |  | ✅ | Command to log the current user out. |
| `systemCommands.lock` | string |  | ✅ | Command to lock the screen. |
| `systemCommands.restart` | string |  | ✅ | Command to reboot the machine. |
| `systemCommands.shutdown` | string |  | ✅ | Command to shut down the machine safely. |
| `themes[]` | array<object> | `` |  | List of available panel themes. |
| `themes[].name` | string |  | ✅ | Human‑friendly theme name. |
| `themes[].icon` | string |  | ✅ | Icon (glyph) representing the theme in lists. |
| `themes[].pixelOffset` | number | `0` |  | Wallpaper parallax offset (‑10 … 10). |
| `themes[].wallpaperDir` | string | `` |  | Directory containing theme wallpapers (may be empty). |
| `themes[].colors` | object |  | ✅ | Palette used by widgets & windows. |
| `themes[].colors.background` | string |  | ✅ |  |
| `themes[].colors.foreground` | string |  | ✅ |  |
| `themes[].colors.primary` | string |  | ✅ |  |
| `themes[].colors.buttonPrimary` | string |  | ✅ |  |
| `themes[].colors.sliderTrough` | string |  | ✅ |  |
| `themes[].colors.hover` | string |  | ✅ |  |
| `themes[].colors.warning` | string |  | ✅ |  |
| `themes[].colors.barBorder` | string |  | ✅ |  |
| `themes[].colors.windowBorder` | string |  | ✅ |  |
| `themes[].colors.alertBorder` | string |  | ✅ |  |