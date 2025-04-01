import {readFile} from "astal/file";
import {exec} from "astal/process";

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

export function getConfig(): Config {
    const homePath = exec('bash -c "echo $HOME"')
    const configStr = readFile(`${homePath}/.config/OkPanel/okpanel.json`) ?? "";
    return JSON.parse(configStr)
}