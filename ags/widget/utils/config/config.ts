import {readFile} from "astal/file";
import {exec, execAsync} from "astal/process";
import {Variable} from "astal";
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

export type Config = {
    themes: Theme[];
    themeUpdateScript: string;
    wallpaperUpdateScript: string;
    systemCommands: {
        logout: string;
        lock: string;
        restart: string;
        shutdown: string;
    };
};

const defaultTheme: Theme = {
    name: "Everforest",
    icon: "󰌪",
    pixelOffset: 0,
    wallpaperDir: "/usr/share/wallpapers/everforest",
    colors: {
        background: "#1E2326",
        foreground: "#D3C6AA",
        primary: "#7A8478",
        buttonPrimary: "#384B55",
        sliderTrough: "#2E383C",
        hover: "#2E383C",
        warning: "#E67E80",
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
EOF

sass $TARGET_DIR/main.scss /tmp/OkPanel/style.css
`
}

export function setTheme(theme: Theme, onFinished: () => void) {
    selectedTheme.set(theme)
    execAsync(`bash -c '

# compile the scss in /tmp
${compileThemeBashScript(theme)}

# cache the selected theme name
mkdir -p ${homeDir}/.cache/OkPanel
echo "${theme.name}" > ${homeDir}/.cache/OkPanel/themeName

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

function initialSetTheme(theme: Theme) {
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

    const savedThemeName = readFile(`${homePath}/.cache/OkPanel/themeName`).trim()

    const savedTheme = config.themes.find((theme) => theme.name === savedThemeName)
    if (savedTheme !== undefined) {
        selectedTheme.set(savedTheme)
    } else if (config.themes.length > 0) {
        selectedTheme.set(config.themes[0])
    }

    return config
}

export function loadConfig(projectDirectory: string, homeDirectory: string) {
    projectDir = projectDirectory
    homeDir = homeDirectory
    checkConfigIntegrity()
    initialSetTheme(selectedTheme.get())
    restoreBar()
}

function checkConfigIntegrity() {
    config.themes.forEach((theme) => {
        if (theme.name === undefined) {
            throw Error("Config invalid.  Problem with themes.")
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
}