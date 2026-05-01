import {exec} from "astal/process";

export interface Keybind {
    locked: boolean,
    mouse: boolean,
    release: boolean,
    repeat: boolean,
    longPress: boolean,
    non_consuming: boolean,
    has_description: boolean,
    modmask: number,
    submap: string,
    key: string,
    keycode: number,
    catch_all: boolean,
    description: string,
    dispatcher: string,
    arg: string

}

export function getKeybindings() {
    const text = exec('hyprctl binds -j')
    let binds: Keybind[] = JSON.parse(text)
    return binds
}