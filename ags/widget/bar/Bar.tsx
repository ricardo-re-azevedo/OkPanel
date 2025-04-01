import {Variable} from "astal";
import {execAsync} from "astal/process";
import {readFile} from "astal/file";
import {homeDir} from "../utils/config/config";

export enum Bar {
    LEFT = "left",
    RIGHT = "right",
    TOP = "top",
    BOTTOM = "bottom",
}

export enum MenuPosition {
    DEFAULT = "default",
    ALTERNATE = "alternate",
}

export enum ClockPosition {
    DEFAULT= "default",
    ALTERNATE = "alternate",
}

export function restoreBar() {
    const details = readFile(`${homeDir}/.cache/OkPanel/savedBar`).trim()

    if (details.trim() === "") {
        return
    }
    const values = details.split(",")
    switch (values[0]) {
        case Bar.LEFT:
            selectedBar.set(Bar.LEFT)
            break;
        case Bar.TOP:
            selectedBar.set(Bar.TOP)
            break;
        case Bar.RIGHT:
            selectedBar.set(Bar.RIGHT)
            break;
        case Bar.BOTTOM:
            selectedBar.set(Bar.BOTTOM)
            break;
    }
    switch (values[1]) {
        case MenuPosition.DEFAULT:
            menuPosition.set(MenuPosition.DEFAULT)
            break;
        case MenuPosition.ALTERNATE:
            menuPosition.set(MenuPosition.ALTERNATE)
            break;
    }
    switch (values[2]) {
        case ClockPosition.DEFAULT:
            clockPosition.set(ClockPosition.DEFAULT)
            break;
        case ClockPosition.ALTERNATE:
            clockPosition.set(ClockPosition.ALTERNATE)
            break;
    }
}

export const selectedBar = Variable(Bar.LEFT)
export const menuPosition = Variable(MenuPosition.DEFAULT)
export const clockPosition = Variable(ClockPosition.DEFAULT)

export function setBarType(bar: Bar) {
    selectedBar.set(bar)
    saveBar()
}

export function setMenuPosition(position: MenuPosition) {
    print(`setting menu position to: ${position}`)
    menuPosition.set(position)
    saveBar()
}

export function setClockPosition(position: ClockPosition) {
    print(`setting clock position to: ${position}`)
    clockPosition.set(position)
    saveBar()
}

function saveBar() {
    execAsync(`bash -c '
mkdir -p ${homeDir}/.cache/OkPanel
echo "${selectedBar.get()},${menuPosition.get()},${clockPosition.get()}" > ${homeDir}/.cache/OkPanel/savedBar
    '`).catch((error) => {
        print(error)
    })
}