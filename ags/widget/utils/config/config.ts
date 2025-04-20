import {readFile} from "astal/file";
import {exec} from "astal/process";
import {Variable} from "astal";
import {restoreBar} from "../../bar/Bar";
import Gio from "gi://Gio?version=2.0";
import {setThemeBasic} from "./themeScripts";

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
        barBorder: string;
        windowBorder: string;
        alertBorder: string;
    };
};

export type VerticalBar = {
    topWidgets: BarWidget[];
    centerWidgets: BarWidget[];
    bottomWidgets: BarWidget[];
    expanded: boolean;
    splitSections: boolean;
    sectionPadding: number;
    minimumHeight: number;
    widgetSpacing: number;
}

export type HorizontalBar = {
    leftWidgets: BarWidget[];
    centerWidgets: BarWidget[];
    rightWidgets: BarWidget[];
    expanded: boolean;
    splitSections: boolean;
    sectionPadding: number;
    minimumWidth: number;
    widgetSpacing: number;
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
    INTEGRATED_TRAY = "integrated_tray",
    APP_LAUNCHER = "app_launcher",
    SCREENSHOT ="screenshot",
}

export enum NotificationsPosition {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
}

export type Notifications = {
    position: NotificationsPosition,
    respectExclusive: boolean,
}

export type SystemCommands = {
    logout: string;
    lock: string;
    restart: string;
    shutdown: string;
}

export type SystemMenu = {
    menuButtonIcon: string;
    enableMprisWidget: boolean;
    enableVpnControls: boolean;
}

export type Windows = {
    gaps: number;
    borderRadius: number;
    borderWidth: number;
}

export type Config = {
    buttonBorderRadius: number;
    largeButtonBorderRadius: number;
    themeUpdateScript: string;
    wallpaperUpdateScript: string;
    mainMonitor: number;
    scrimColor: string;
    font: string;
    windows: Windows;
    notifications: Notifications;
    verticalBar: VerticalBar;
    horizontalBar: HorizontalBar;
    systemMenu: SystemMenu;
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
        barBorder: "#7C545F",
        windowBorder: "#AFB3BD",
        alertBorder: "#7C545F",
    },
}

export const selectedTheme = Variable<Theme>(defaultTheme)
export const config = getConfig()
export let projectDir = ""
export let homeDir = ""

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

function checkConfigIntegrity(config: Config) {
    if (config.themes === undefined) {
        config.themes = []
    }
    config.themes.forEach((theme) => {
        if (theme.name === undefined) {
            throw Error("Config invalid.  Problem with themes.  Name undefined.")
        }
        if (theme.icon === undefined
            || theme.colors === undefined
            || theme.colors.background === undefined
            || theme.colors.foreground === undefined
            || theme.colors.hover === undefined
            || theme.colors.primary === undefined
            || theme.colors.buttonPrimary === undefined
            || theme.colors.sliderTrough === undefined
            || theme.colors.warning === undefined
            || theme.colors.barBorder === undefined
            || theme.colors.windowBorder === undefined
            || theme.colors.alertBorder === undefined
        ) {
            throw Error(`Config invalid.  Problem with ${theme.name} theme.`)
        }
        if (theme.wallpaperDir === undefined) {
            theme.wallpaperDir = ""
        }
        if (theme.pixelOffset === undefined) {
            theme.pixelOffset = 0
        }
        if (theme.wallpaperDir !== "" && !Gio.file_new_for_path(theme.wallpaperDir).query_exists(null)) {
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
    if (config.buttonBorderRadius === undefined) {
        config.buttonBorderRadius = 8
    }
    if (config.largeButtonBorderRadius === undefined) {
        config.largeButtonBorderRadius = 16
    }
    if (config.mainMonitor === undefined) {
        config.mainMonitor = 0
    }
    if (config.horizontalBar === undefined) {
        config.horizontalBar = {
            leftWidgets: [
                BarWidget.MENU,
                BarWidget.WORKSPACES,
            ],
            centerWidgets: [
                BarWidget.CLOCK,
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
            ],
            expanded: true,
            splitSections: false,
            sectionPadding: 0,
            minimumWidth: 800,
            widgetSpacing: 0,
        }
    }
    if (config.horizontalBar.leftWidgets === undefined) {
        config.horizontalBar.leftWidgets = [
            BarWidget.MENU,
            BarWidget.WORKSPACES,
        ]
    }
    if (config.horizontalBar.centerWidgets === undefined) {
        config.horizontalBar.centerWidgets = [
            BarWidget.CLOCK,
        ]
    }
    if (config.horizontalBar.rightWidgets === undefined) {
        config.horizontalBar.rightWidgets = [
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
    if (config.horizontalBar.expanded === undefined) {
        config.horizontalBar.expanded = true
    }
    if (config.horizontalBar.splitSections === undefined) {
        config.horizontalBar.splitSections = false
    }
    if (config.horizontalBar.sectionPadding === undefined) {
        config.horizontalBar.sectionPadding = 0
    }
    if (config.horizontalBar.minimumWidth === undefined) {
        config.horizontalBar.minimumWidth = 800
    }
    if (config.horizontalBar.widgetSpacing === undefined) {
        config.horizontalBar.widgetSpacing = 0
    }

    if (config.verticalBar === undefined) {
        config.verticalBar = {
            topWidgets: [
                BarWidget.MENU,
                BarWidget.WORKSPACES,
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
            ],
            expanded: true,
            splitSections: false,
            sectionPadding: 0,
            minimumHeight: 600,
            widgetSpacing: 0,
        }
    }
    if (config.verticalBar.topWidgets === undefined) {
        config.verticalBar.topWidgets = [
            BarWidget.MENU,
            BarWidget.WORKSPACES,
        ]
    }
    if (config.verticalBar.centerWidgets === undefined) {
        config.verticalBar.centerWidgets = []
    }
    if (config.verticalBar.bottomWidgets === undefined) {
        config.verticalBar.bottomWidgets = [
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
    if (config.verticalBar.expanded === undefined) {
        config.verticalBar.expanded = true
    }
    if (config.verticalBar.splitSections === undefined) {
        config.verticalBar.splitSections = false
    }
    if (config.verticalBar.sectionPadding === undefined) {
        config.verticalBar.sectionPadding = 0
    }
    if (config.verticalBar.minimumHeight === undefined) {
        config.verticalBar.minimumHeight = 600
    }
    if (config.verticalBar.widgetSpacing === undefined) {
        config.verticalBar.widgetSpacing = 0
    }

    if (config.notifications === undefined) {
        config.notifications = {
            position: NotificationsPosition.RIGHT,
            respectExclusive: true
        }
    }
    if (config.notifications.position === undefined) {
        config.notifications.position = NotificationsPosition.RIGHT
    }
    if (config.notifications.position !== "left" && config.notifications.position !== "right" && config.notifications.position !== "center") {
        throw Error(`Config invalid.  Notification position must be left, right, or center.`)
    }
    if (config.notifications.respectExclusive === undefined) {
        config.notifications.respectExclusive = true
    }
    if (config.systemMenu === undefined) {
        config.systemMenu = {
            menuButtonIcon: "",
            enableMprisWidget: true,
            enableVpnControls: true,
        }
    }
    if (config.systemMenu.menuButtonIcon === undefined) {
        config.systemMenu.menuButtonIcon = ""
    }
    if (config.systemMenu.enableMprisWidget === undefined) {
        config.systemMenu.enableMprisWidget = true
    }
    if (config.systemMenu.enableVpnControls === undefined) {
        config.systemMenu.enableVpnControls = true
    }

    if (config.scrimColor === undefined) {
        config.scrimColor = "#00000001"
    }
    if (config.windows === undefined) {
        config.windows = {
            gaps: 5,
            borderRadius: 8,
            borderWidth: 2
        }
    }
    if (config.windows.gaps === undefined) {
        config.windows.gaps = 5
    }
    if (config.windows.borderRadius === undefined) {
        config.windows.borderRadius = 8
    }
    if (config.windows.borderWidth === undefined) {
        config.windows.borderWidth = 2
    }
    if (config.font === undefined) {
        config.font = "JetBrainsMono NF"
    }
}