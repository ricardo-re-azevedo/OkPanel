import {App} from "astal/gtk4"
import Calendar from "./widget/calendar/Calendar"
import SystemMenuWindow from "./widget/systemMenu/SystemMenuWindow";
import {BrightnessAlert, ChargingAlertSound, VolumeAlert} from "./widget/alerts/Alerts";
import NotificationPopups from "./widget/notification/NotificationPopups";
import AppLauncher, {AppLauncherWindowName} from "./widget/appLauncher/AppLauncher";
import Screenshot, {ScreenshotWindowName} from "./widget/screenshot/Screenshot";
import Screenshare, {ScreenshareWindowName, updateResponse, updateWindows} from "./widget/screenshare/Screenshare";
import VerticalBar from "./widget/bar/VerticalBar";
import HorizontalBar from "./widget/bar/HorizontalBar";
import {decreaseVolume, increaseVolume, muteVolume} from "./widget/utils/audio";
import {loadConfig, setThemeBasic} from "./widget/utils/config/config";
import {parseTheme} from "./widget/utils/config/themeParser";
import TrayWindow from "./widget/tray/TrayWindow";

App.start({
    instanceName: "OkPanel",
    css: "/tmp/OkPanel/style.css",
    main(...args: Array<string>) {
        loadConfig(args[0], args[1])

        VerticalBar()
        HorizontalBar()
        Calendar()
        SystemMenuWindow()
        App.get_monitors().map(VolumeAlert)
        App.get_monitors().map(BrightnessAlert)
        ChargingAlertSound()
        App.get_monitors().map(NotificationPopups)
        AppLauncher()
        Screenshot()
        Screenshare()
        TrayWindow()
    },
    requestHandler(request: string, res: (response: any) => void) {
        if (request.startsWith("theme")) {
            const theme = parseTheme(request)
            setThemeBasic(theme)
            res("ags theme applied")
        } else if (request === "appLauncher") {
            App.toggle_window(AppLauncherWindowName)
            res("app launcher toggled")
        } else if (request === "screenshot") {
            App.toggle_window(ScreenshotWindowName)
            res("screenshot toggled")
        } else if (request.startsWith("screenshare")) {
            print(request.startsWith("screenshare"))
            updateWindows(request)
            updateResponse(res)
            App.toggle_window(ScreenshareWindowName)
        } else if (request.startsWith("volume-up")) {
            increaseVolume()
            res("volume up")
        } else if (request.startsWith("volume-down")) {
            decreaseVolume()
            res("volume down")
        } else if (request.startsWith("mute")) {
            muteVolume()
            res("mute")
        } else {
            res("command not found")
        }
    }
})
