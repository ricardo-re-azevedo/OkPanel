import {readFile} from "astal/file";
import {Theme} from "./configSchema";
import {config, homeDir, projectDir, selectedBar, selectedTheme} from "./config";
import {execAsync} from "astal/process";
import {App} from "astal/gtk4";
import {GLib} from "astal";
import Gio from "gi://Gio?version=2.0";
import {Bar} from "./bar";

export function setBarType(bar: Bar) {
    selectedBar.set(bar)
    saveBar()
}

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

export function restoreSavedState() {

    let savedTheme: Theme | null = null

    // read config file if it exists
    const dir = Gio.File.new_for_path(`${homeDir}/.cache/OkPanel/theme`)
    if (dir.query_exists(null)) {
        const savedThemeString = readFile(`${homeDir}/.cache/OkPanel/theme`).trim()

        if (savedThemeString !== "") {
            savedTheme = JSON.parse(savedThemeString)
        }
    }

    if (savedTheme !== null) {
        if (config.themes.length > 0) {
            // we have a saved theme, and we have configured themes.
            // if the saved theme is not in the configured themes, don't use it.
            const matchingConfigTheme = config.themes.find((theme) => theme.name === savedTheme.name)
            if (matchingConfigTheme !== undefined) {
                print("Cached theme config exists, using matching theme from configured themes")
                selectedTheme.set(matchingConfigTheme)
            } else if (config.themes.length > 0) {
                print(`Cached theme config exists, no configured theme for theme defined in cache, falling back to first configured theme: ${config.themes[0].name}`)
                selectedTheme.set(config.themes[0])
            }
        } else {
            // we have a saved theme and no configured themes
            print("Cached theme config exists, using theme from cache (no configured themes)")
            selectedTheme.set(savedTheme)
        }
    } else if (config.themes.length > 0) {
        // we have no saved themes, but we do have configured themes
        // use the first configconfig.themes[0]ured theme
        print(`No cached theme config exists, falling back to first configured theme: ${config.themes[0].name}`)
        selectedTheme.set(config.themes[0])
    }

    setThemeBasic(selectedTheme.get())
    restoreBar()
}

function restoreBar() {

    // read config file if it exists
    const dir = Gio.File.new_for_path(`${homeDir}/.cache/OkPanel/savedBar`)
    let details: string | null = null

    if (dir.query_exists(null)) {
        details = readFile(`${homeDir}/.cache/OkPanel/savedBar`).trim()
    } else {
        print ("No cached config file for bar")
        return
    }

    if (details.trim() === "") {
        print ("Cached config file for bar exists but has no configuration")
        return
    }

    switch (details) {
        case Bar.TOP:
            selectedBar.set(Bar.TOP)
            break;
        case Bar.BOTTOM:
            selectedBar.set(Bar.BOTTOM)
            break;
    }
}

function saveBar() {
    execAsync(`bash -c '
mkdir -p ${homeDir}/.cache/OkPanel
echo "${selectedBar.get()}" > ${homeDir}/.cache/OkPanel/savedBar
    '`).catch((error) => {
        print(error)
    })
}

function cacheTheme(theme: Theme) {
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
\\$font: "${config.font}";
\\$bg: ${theme.colors.background};
\\$fg: ${theme.colors.foreground};
\\$primary: ${theme.colors.primary};
\\$buttonPrimary: ${theme.colors.buttonPrimary};
\\$sliderTrough: ${theme.colors.sliderTrough};
\\$bgHover: ${theme.colors.hover};
\\$warning: ${theme.colors.warning};
\\$barBorder: ${theme.colors.barBorder};
\\$windowBorder: ${theme.colors.windowBorder};
\\$alertBorder: ${theme.colors.alertBorder};
\\$gaps: ${config.windows.gaps}px;
\\$buttonBorderRadius: ${config.buttonBorderRadius}px;
\\$windowBorderRadius: ${config.windows.borderRadius}px;
\\$windowBorderWidth: ${config.windows.borderWidth}px;
\\$largeButtonBorderRadius: ${config.largeButtonBorderRadius}px;
\\$scrimColor: ${config.scrimColor};
EOF

sass $TARGET_DIR/main.scss /tmp/OkPanel/style.css
`
}
