import {readFile} from "astal/file";
import {exec} from "astal/process";
import {Variable} from "astal";
import {restoreBar} from "../../bar/Bar";
import {setThemeBasic} from "./themeScripts";
import {loadConfig, validateAndApplyDefaults} from "./configLoader";
import {Config, Theme, themeSchema} from "./configSchema";

function createTheme(raw: any): Theme {
    return validateAndApplyDefaults<Theme>(raw, themeSchema.children!);
}

const defaultTheme: Theme = createTheme({
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
        barBorder: "#7C545F",
        windowBorder: "#AFB3BD",
        alertBorder: "#7C545F",
    },
})

export const selectedTheme = Variable<Theme>(defaultTheme)
export const config: Config = getConfig()
export let projectDir = ""
export let homeDir = ""

function getConfig(): Config {
    const homePath = exec('bash -c "echo $HOME"')
    return loadConfig(`${homePath}/.config/OkPanel/okpanel.conf`)
}

export function restoreSavedState(projectDirectory: string, homeDirectory: string) {
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
            // we have a saved theme and no configured themes
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