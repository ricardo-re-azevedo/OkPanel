import {exec} from "astal/process";
import {GLib, Variable} from "astal";
import {loadConfig, validateAndApplyDefaults} from "./configLoader";
import {Config, Theme, themeSchema} from "./configSchema";
import {Bar} from "./bar";
import Gio from "gi://Gio?version=2.0";

export const config: Config = (() => {
    const homePath = exec('bash -c "echo $HOME"')
    return loadConfig(`${homePath}/.config/OkPanel/okpanel.conf`)
})()

export const selectedTheme = Variable<Theme>(
    validateAndApplyDefaults<Theme>({
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
    }, themeSchema.children!)
)

export const selectedBar = Variable(Bar.TOP)

export let projectDir = ""
export let homeDir = GLib.get_home_dir()

export function setProjectDir() {
    const dir = Gio.File.new_for_path('.').get_path()
    print(`Running app from ${dir}`)
    if (typeof dir == "string") {
        projectDir = dir
    }
}

export function setHomeDir(dir: string) {
    homeDir = dir
}