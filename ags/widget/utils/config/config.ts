import {readFile} from "astal/file";
import {exec, execAsync} from "astal/process";
import {GLib, Variable} from "astal";
import {App} from "astal/gtk4";
import {restoreBar} from "../../bar/Bar";
import Gio from "gi://Gio?version=2.0";

export type Theme = {
    name: string;
    icon: string;
    pixelOffset: number;
    wallpaperDir: string;
    colors: {
        background: string;
        foreground: string;
        primary: string;
        buttonPrimary: string;
        sliderTrough: string;
        hover: string;
        warning: string;
    };
};

export type VerticalBar = {
    topWidgets: BarWidget[];
    centerWidgets: BarWidget[];
    bottomWidgets: BarWidget[];
}

export type HorizontalBar = {
    leftWidgets: BarWidget[];
    centerWidgets: BarWidget[];
    rightWidgets: BarWidget[];
}

export enum BarWidget {
    MENU = "menu",
    WORKSPACES = "workspaces",
    CLOCK =  "clock",
    AUDIO_OUT = "audio_out",
    AUDIO_IN = "audio_in",
    BLUETOOTH = "bluetooth",
    NETWORK = "network",
    RECORDING_INDICATOR =  "recording_indicator",
    VPN_INDICATOR = "vpn_indicator",
    BATTERY = "battery",
    TRAY = "tray",
}

export enum NotificationsPosition {
    LEFT = "left",
    RIGHT = "right"
}

export type SystemCommands = {
    logout: string;
    lock: string;
    restart: string;
    shutdown: string;
}

export type Config = {
    gaps: number;
    borderRadius: number;
    windowBorderRadius: number;
    largeButtonBorderRadius: number;
    themeUpdateScript: string;
    wallpaperUpdateScript: string;
    notificationsPosition: NotificationsPosition;
    verticalBar: VerticalBar;
    horizontalBar: HorizontalBar;
    systemCommands: SystemCommands;
    themes: Theme[];
};

const defaultTheme: Theme = {
    name: "Bloodrust",
    icon: "",
    pixelOffset: 2,
    wallpaperDir: "",
    colors: {
        background: "#1F2932",
        foreground: "#AFB3BD",
        primary: "#7C545F",
        buttonPrimary: "#7C545F",
        sliderTrough: "#293642",
        hover: "#293642",
        warning: "#7C7C54",
    },
}

export const selectedTheme = Variable<Theme>(defaultTheme)
export const config = getConfig()
export let projectDir = ""
export let homeDir = ""

export function setWallpaper(path: string) {
    const theme = selectedTheme.get()
    execAsync(`bash -c '

# if the wallpaper update script exists
if [[ -f "${config.wallpaperUpdateScript}" ]]; then
    # call the wallpaper script
    ${config.wallpaperUpdateScript} ${path}
    
    # cache the name of the selected wallpaper
    mkdir -p ${homeDir}/.cache/OkPanel/wallpaper
    echo "${path}" > ${homeDir}/.cache/OkPanel/wallpaper/${theme.name}
fi

    '`).catch((error) => {
        print(error)
    })
}

function cacheTheme(theme: Theme) {
    const homeDir = GLib.get_home_dir()
    const dirPath = `${homeDir}/.cache/OkPanel`
    const filePath = `${dirPath}/theme`

    // Ensure the directory exists
    const dir = Gio.File.new_for_path(dirPath)
    if (!dir.query_exists(null)) {
        dir.make_directory_with_parents(null)
    }

    // Write the file
    const file = Gio.File.new_for_path(filePath)
    const outputStream = file.replace(null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null)

    const data = JSON.stringify(theme, null, 2)
    outputStream.write(data, null)
    outputStream.close(null)
}

function compileThemeBashScript(theme: Theme) {
    return `
SOURCE_DIR="${projectDir}/scss"
TARGET_DIR="/tmp/OkPanel/scss"

# Remove existing target if it exists
if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
fi
mkdir -p /tmp/OkPanel
cp -r "$SOURCE_DIR" "$TARGET_DIR"

cat > "$TARGET_DIR/variables.scss" <<EOF
\\$bg: ${theme.colors.background};
\\$fg: ${theme.colors.foreground};
\\$primary: ${theme.colors.primary};
\\$buttonPrimary: ${theme.colors.buttonPrimary};
\\$sliderTrough: ${theme.colors.sliderTrough};
\\$bgHover: ${theme.colors.hover};
\\$warning: ${theme.colors.warning};
\\$gaps: ${config.gaps}px;
\\$borderRadius: ${config.borderRadius}px;
\\$windowBorderRadius: ${config.windowBorderRadius}px;
\\$largeButtonBorderRadius: ${config.largeButtonBorderRadius}px;
EOF

sass $TARGET_DIR/main.scss /tmp/OkPanel/style.css
`
}

export function setTheme(theme: Theme, onFinished: () => void) {
    selectedTheme.set(theme)
    cacheTheme(theme)
    execAsync(`bash -c '

# compile the scss in /tmp
${compileThemeBashScript(theme)}

# if the set theme script exists
if [[ -f "${config.themeUpdateScript}" ]]; then
    # call the external update theme 
    ${config.themeUpdateScript} ${theme.name}
fi

# if the update wallpaper script exists
if [[ -f "${config.wallpaperUpdateScript}" ]]; then
    # if there is a cached wallpaper for this theme, then set it
    WALLPAPER_CACHE_PATH="${homeDir}/.cache/OkPanel/wallpaper/${theme.name}"
    # Check if the file exists and is non-empty
    if [[ -s "$WALLPAPER_CACHE_PATH" ]]; then
        # Read the wallpaper path from the file
        potentialWallpaper="$(< "$WALLPAPER_CACHE_PATH")"
        
        # Check if that file actually exists
        if [[ -f "$potentialWallpaper" ]]; then
          WALLPAPER="$potentialWallpaper"
        else
          # Fallback: pick the first .jpg or .png in the wallpaper dir
          WALLPAPER="$(
            ls -1 "${theme.wallpaperDir}"/*.jpg "${theme.wallpaperDir}"/*.png 2>/dev/null | head -n1
          )"
        fi
    else
    # If there is no cached wallpaper path, do the same fallback
    WALLPAPER="$(
      ls -1 "${theme.wallpaperDir}"/*.jpg "${theme.wallpaperDir}"/*.png 2>/dev/null | head -n1
    )"
    fi
    
    ${config.wallpaperUpdateScript} $WALLPAPER
fi

    '`).catch((error) => {
        print(error)
    }).finally(() => {
        App.apply_css("/tmp/OkPanel/style.css")
        onFinished()
    })
}

/**
 * Sets the theme for ags.  Does not call user's external scripts
 */
export function setThemeBasic(theme: Theme) {
    cacheTheme(theme)
    execAsync(`bash -c '
# compile the scss in /tmp
${compileThemeBashScript(theme)}
    '`).catch((error) => {
        print(error)
    }).finally(() => {
        App.apply_css("/tmp/OkPanel/style.css")
    })
}

function getConfig(): Config {
    const homePath = exec('bash -c "echo $HOME"')
    const configStr = readFile(`${homePath}/.config/OkPanel/okpanel.json`) ?? "";
    const config: Config = JSON.parse(configStr)

    checkConfigIntegrity(config)

    return config
}

export function loadConfig(projectDirectory: string, homeDirectory: string) {
    projectDir = projectDirectory
    homeDir = homeDirectory

    const savedThemeString = readFile(`${homeDir}/.cache/OkPanel/theme`).trim()

    let savedTheme: Theme | null = null
    try {
        if (savedThemeString !== "") {
            savedTheme = JSON.parse(savedThemeString)
        }
    } catch (e) {
        print(e)
    }
    if (savedTheme !== null) {
        if (config.themes.length > 0) {
            // we have a saved theme, and we have configured themes.
            // if the saved theme is not in the configured themes, don't use it.
            const matchingConfigTheme = config.themes.find((theme) => theme.name === savedTheme.name)
            if (matchingConfigTheme !== undefined) {
                selectedTheme.set(matchingConfigTheme)
            } else if (config.themes.length > 0) {
                selectedTheme.set(config.themes[0])
            }
        } else {
            // we have a saved theme, and no configured themes
            selectedTheme.set(savedTheme)
        }
    } else if (config.themes.length > 0) {
        // we have no saved themes, but we do have configured themes
        // use the first configured theme
        selectedTheme.set(config.themes[0])
    }

    setThemeBasic(selectedTheme.get())
    restoreBar()
}

function checkConfigIntegrity(config: Config) {
    if (config.themes === undefined) {
        config.themes = []
    }
    config.themes.forEach((theme) => {
        if (theme.name === undefined) {
            throw Error("Config invalid.  Problem with themes.  Name undefined.")
        }
        if (theme.wallpaperDir === undefined
            || theme.icon === undefined
            || theme.pixelOffset === undefined
            || theme.colors === undefined
            || theme.colors.background === undefined
            || theme.colors.foreground === undefined
            || theme.colors.hover === undefined
            || theme.colors.primary === undefined
            || theme.colors.buttonPrimary === undefined
            || theme.colors.sliderTrough === undefined
            || theme.colors.warning === undefined
        ) {
            throw Error(`Config invalid.  Problem with ${theme.name} theme.`)
        }
        if (!Gio.file_new_for_path(theme.wallpaperDir).query_exists(null)) {
            throw Error(`Config invalid.  Wallpaper directory for theme ${theme.name} does not exist.`)
        }
        if (theme.pixelOffset >= 10 || theme.pixelOffset <= -10) {
            throw Error(`Config invalid.  Problem with ${theme.name} theme.  Pixel offset must be between -10 and 10.`)
        }
    })
    if (config.systemCommands === undefined
        || config.systemCommands.lock === undefined
        || config.systemCommands.logout === undefined
        || config.systemCommands.restart === undefined
        || config.systemCommands.shutdown === undefined
    ) {
        throw Error("Config invalid.  Problem with system commands.")
    }
    if (config.wallpaperUpdateScript !== undefined) {
        if (!Gio.file_new_for_path(config.wallpaperUpdateScript).query_exists(null)) {
            throw Error(`Config invalid.  Wallpaper update script does not exist.`)
        }
    }
    if (config.themeUpdateScript !== undefined) {
        if (!Gio.file_new_for_path(config.themeUpdateScript).query_exists(null)) {
            throw Error(`Config invalid.  Theme update script does not exist.`)
        }
    }
    if (config.gaps === undefined) {
        config.gaps = 5
    }
    if (config.borderRadius === undefined) {
        config.borderRadius = 8
    }
    if (config.windowBorderRadius === undefined) {
        config.windowBorderRadius = 8
    }
    if (config.largeButtonBorderRadius === undefined) {
        config.largeButtonBorderRadius = 16
    }
    if (config.horizontalBar === undefined) {
        config.horizontalBar = {
            leftWidgets: [
                BarWidget.MENU,
                BarWidget.WORKSPACES
            ],
            centerWidgets: [
                BarWidget.CLOCK
            ],
            rightWidgets: [
                BarWidget.RECORDING_INDICATOR,
                BarWidget.TRAY,
                BarWidget.AUDIO_OUT,
                BarWidget.AUDIO_IN,
                BarWidget.BLUETOOTH,
                BarWidget.VPN_INDICATOR,
                BarWidget.NETWORK,
                BarWidget.BATTERY,
            ]
        }
    }
    if (config.horizontalBar.leftWidgets === undefined) {
        config.horizontalBar.leftWidgets = []
    }
    if (config.horizontalBar.centerWidgets === undefined) {
        config.horizontalBar.centerWidgets = []
    }
    if (config.horizontalBar.rightWidgets === undefined) {
        config.horizontalBar.rightWidgets = []
    }
    if (!config.horizontalBar.leftWidgets.includes(BarWidget.MENU) &&
            !config.horizontalBar.centerWidgets.includes(BarWidget.MENU) &&
            !config.horizontalBar.rightWidgets.includes(BarWidget.MENU)) {
        throw Error(`Config invalid.  Bar must contain the menu widget.`)
    }
    if (!config.horizontalBar.leftWidgets.includes(BarWidget.RECORDING_INDICATOR) &&
        !config.horizontalBar.centerWidgets.includes(BarWidget.RECORDING_INDICATOR) &&
        !config.horizontalBar.rightWidgets.includes(BarWidget.RECORDING_INDICATOR)) {
        throw Error(`Config invalid.  Bar must contain the recording indicator widget.`)
    }

    if (config.verticalBar === undefined) {
        config.verticalBar = {
            topWidgets: [
                BarWidget.MENU,
                BarWidget.WORKSPACES
            ],
            centerWidgets: [],
            bottomWidgets: [
                BarWidget.RECORDING_INDICATOR,
                BarWidget.TRAY,
                BarWidget.AUDIO_OUT,
                BarWidget.AUDIO_IN,
                BarWidget.BLUETOOTH,
                BarWidget.VPN_INDICATOR,
                BarWidget.NETWORK,
                BarWidget.BATTERY,
                BarWidget.CLOCK,
            ]
        }
    }
    if (config.verticalBar.topWidgets === undefined) {
        config.verticalBar.topWidgets = []
    }
    if (config.verticalBar.centerWidgets === undefined) {
        config.verticalBar.centerWidgets = []
    }
    if (config.verticalBar.bottomWidgets === undefined) {
        config.verticalBar.bottomWidgets = []
    }
    if (!config.verticalBar.topWidgets.includes(BarWidget.MENU) &&
        !config.verticalBar.centerWidgets.includes(BarWidget.MENU) &&
        !config.verticalBar.bottomWidgets.includes(BarWidget.MENU)) {
        throw Error(`Config invalid.  Bar must contain the menu widget.`)
    }
    if (!config.verticalBar.topWidgets.includes(BarWidget.RECORDING_INDICATOR) &&
        !config.verticalBar.centerWidgets.includes(BarWidget.RECORDING_INDICATOR) &&
        !config.verticalBar.bottomWidgets.includes(BarWidget.RECORDING_INDICATOR)) {
        throw Error(`Config invalid.  Bar must contain the recording indicator widget.`)
    }

    if (config.notificationsPosition === undefined) {
        config.notificationsPosition = NotificationsPosition.RIGHT
    }
    if (config.notificationsPosition !== "left" && config.notificationsPosition !== "right") {
        throw Error(`Config invalid.  Notification position must be left or right.`)
    }
}