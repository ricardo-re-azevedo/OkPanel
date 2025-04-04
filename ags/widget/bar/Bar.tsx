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

export function restoreBar() {
    const details = readFile(`${homeDir}/.cache/OkPanel/savedBar`).trim()

    if (details.trim() === "") {
        return
    }
    switch (details) {
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
}

export const selectedBar = Variable(Bar.LEFT)

export function setBarType(bar: Bar) {
    selectedBar.set(bar)
    saveBar()
}

function saveBar() {
    execAsync(`bash -c '
mkdir -p ${homeDir}/.cache/OkPanel
echo "${selectedBar.get()}" > ${homeDir}/.cache/OkPanel/savedBar
    '`).catch((error) => {
        print(error)
    })
}