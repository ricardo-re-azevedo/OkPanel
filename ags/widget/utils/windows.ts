import {App} from "astal/gtk4";
import {SystemMenuWindowName} from "../systemMenu/SystemMenuWindow";
import {scrimsVisible} from "../common/Scrim";
import {CalendarWindowName} from "../calendar/Calendar";
import {ScreenshareWindowName} from "../screenshare/Screenshare";
import {ScreenshotWindowName} from "../screenshot/Screenshot";
import {ShortcutsWindowName} from "../shortcuts/Shortcuts";
import {BatteryWindowName} from "../bar/widgets/Battery";
import {NetworkWindowName} from "../bar/widgets/Network"
import {BluetoothWindowName} from "../bar/widgets/Bluetooth";

export function toggleWindow(windowName: string) {
    const window = App.get_windows().find((window) => window.name === windowName)
    if (window !== undefined && !window.visible) {
        scrimsVisible.set(true)
        window.show()
    } else if (window?.visible) {
        window?.hide()
    }
}

export function hideAllWindows() {
    const windows = App.get_windows().filter((window) => {
        return window.name === SystemMenuWindowName ||
            window.name === CalendarWindowName ||
            window.name === ScreenshareWindowName ||
            window.name === ScreenshotWindowName ||
            window.name === ShortcutsWindowName ||
            window.name === BatteryWindowName ||
            window.name === NetworkWindowName ||
            window.name === BluetoothWindowName
    })
    windows.forEach((window) => {
        window.hide()
    })
    scrimsVisible.set(false)
}