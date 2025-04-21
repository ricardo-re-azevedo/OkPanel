# Example config

```
# ───────────── General settings ─────────────
largeButtonBorderRadius = 16

themeUpdateScript      = "/home/john/workspace/scripts/setTheme.sh"
wallpaperUpdateScript  = "/home/john/workspace/scripts/setWallpaper.sh"

# ───────────── Horizontal bar ─────────────
horizontalBar {
    leftWidgets   = [menu, workspaces]
    centerWidgets = [clock]
    rightWidgets  = [
        recording_indicator,
        audio_out,
        audio_in,
        bluetooth,
        vpn_indicator,
        network,
        battery,
        tray
    ]
}

# ───────────── Vertical bar ─────────────
verticalBar {
    topWidgets    = [menu, workspaces]
    centerWidgets = []
    bottomWidgets = [
        recording_indicator,
        tray,
        audio_out,
        audio_in,
        bluetooth,
        vpn_indicator,
        network,
        battery,
        clock
    ]
}

# ───────────── Power commands ─────────────
systemCommands {
    logout   = uwsm stop
    lock     = uwsm app -- hyprlock
    restart  = systemctl reboot
    shutdown = systemctl poweroff
}

# ───────────── Themes ─────────────
themes = [

    {
        name         = everforest
        icon         = 󰌪
        pixelOffset  = 1
        wallpaperDir = /home/john/workspace/Pictures/wallpaper/everforest
        
        colors = {
            background    = #1E2326
            foreground    = #D3C6AA
            primary       = #7A8478
            buttonPrimary = #384B55
            sliderTrough  = #2E383C
            hover         = #2E383C
            warning       = #E67E80
            barBorder     = #7A8478
            windowBorder  = #D3C6AA
            alertBorder   = #7A8478
        }
    }
    
    {
        name         = nord
        icon         = 
        pixelOffset  = 2
        wallpaperDir = /home/john/workspace/Pictures/wallpaper/nord
        
        colors = {
            background    = #2e3440
            foreground    = #d8dee9
            primary       = #81a1c1
            buttonPrimary = #5e81ac
            sliderTrough  = #4c566a
            hover         = #4c566a
            warning       = #BF616A
            barBorder     = #81a1c1
            windowBorder  = #d8dee9
            alertBorder   = #81a1c1
        }
    }
    
]
```