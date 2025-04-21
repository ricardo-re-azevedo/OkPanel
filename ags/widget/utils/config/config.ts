import {readFile} from "astal/file";
import {exec} from "astal/process";
import {Variable} from "astal";
import {restoreBar} from "../../bar/Bar";
import {setThemeBasic} from "./themeScripts";
import {loadConfig, validateAndApplyDefaults} from "./configLoader";
import {Config, CONFIG_SCHEMA, Theme} from "./newConfig";

// export type Theme = {
//     name: string;
//     icon: string;
//     pixelOffset: number;
//     wallpaperDir: string;
//     colors: {
//         background: string;
//         foreground: string;
//         primary: string;
//         buttonPrimary: string;
//         sliderTrough: string;
//         hover: string;
//         warning: string;
//         barBorder: string;
//         windowBorder: string;
//         alertBorder: string;
//     };
// };
//
// export type VerticalBar = {
//     topWidgets: BarWidget[];
//     centerWidgets: BarWidget[];
//     bottomWidgets: BarWidget[];
//     expanded: boolean;
//     splitSections: boolean;
//     sectionPadding: number;
//     minimumHeight: number;
//     widgetSpacing: number;
// }
//
// export type HorizontalBar = {
//     leftWidgets: BarWidget[];
//     centerWidgets: BarWidget[];
//     rightWidgets: BarWidget[];
//     expanded: boolean;
//     splitSections: boolean;
//     sectionPadding: number;
//     minimumWidth: number;
//     widgetSpacing: number;
// }
//
// export enum BarWidget {
//     MENU = "menu",
//     WORKSPACES = "workspaces",
//     CLOCK =  "clock",
//     AUDIO_OUT = "audio_out",
//     AUDIO_IN = "audio_in",
//     BLUETOOTH = "bluetooth",
//     NETWORK = "network",
//     RECORDING_INDICATOR =  "recording_indicator",
//     VPN_INDICATOR = "vpn_indicator",
//     BATTERY = "battery",
//     TRAY = "tray",
//     INTEGRATED_TRAY = "integrated_tray",
//     APP_LAUNCHER = "app_launcher",
//     SCREENSHOT ="screenshot",
// }
//
// export enum NotificationsPosition {
//     LEFT = "left",
//     RIGHT = "right",
//     CENTER = "center",
// }
//
// export type Notifications = {
//     position: NotificationsPosition,
//     respectExclusive: boolean,
// }
//
// export type SystemCommands = {
//     logout: string;
//     lock: string;
//     restart: string;
//     shutdown: string;
// }
//
// export type SystemMenu = {
//     menuButtonIcon: string;
//     enableMprisWidget: boolean;
//     enableVpnControls: boolean;
// }
//
// export type Windows = {
//     gaps: number;
//     borderRadius: number;
//     borderWidth: number;
// }
//
// export type Config = {
//     buttonBorderRadius: number;
//     largeButtonBorderRadius: number;
//     themeUpdateScript: string;
//     wallpaperUpdateScript: string;
//     mainMonitor: number;
//     scrimColor: string;
//     font: string;
//     windows: Windows;
//     notifications: Notifications;
//     verticalBar: VerticalBar;
//     horizontalBar: HorizontalBar;
//     systemMenu: SystemMenu;
//     systemCommands: SystemCommands;
//     themes: Theme[];
// };
//

const themeSchema = (CONFIG_SCHEMA.find(f => f.name === "themes")!.item!)!;

function createTheme(raw: any): Theme {
    // validateAndApplyDefaults returns filled‑in object
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