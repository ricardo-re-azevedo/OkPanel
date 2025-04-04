import {App, Gtk} from "astal/gtk4"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import {execAsync} from "astal/process"
import {config} from "../utils/config/config";
import LargeIconButton from "../common/LargeIconButton";

export default function () {
    return <box
        vertical={false}
        halign={Gtk.Align.CENTER}
        spacing={12}>
        <LargeIconButton
            icon="󰍃"
            offset={0}
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.logout)
            }}/>
        <LargeIconButton
            icon=""
            offset={1}
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.lock)
            }}/>
        <LargeIconButton
            icon=""
            offset={0}
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.restart)
            }}/>
        <LargeIconButton
            icon="⏻"
            offset={2}
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.shutdown)
            }}/>
    </box>
}