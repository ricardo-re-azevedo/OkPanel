import {Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import {config} from "../utils/config/config";
import LargeIconButton from "../common/LargeIconButton";
import {hideAllWindows} from "../utils/windows";

export default function () {
    return <box
        vertical={false}
        halign={Gtk.Align.CENTER}
        spacing={12}>
        <LargeIconButton
            icon="󰍃"
            offset={0}
            onClicked={() => {
                hideAllWindows()
                execAsync(config.systemCommands.logout)
            }}/>
        <LargeIconButton
            icon=""
            offset={2}
            onClicked={() => {
                hideAllWindows()
                execAsync(config.systemCommands.lock)
            }}/>
        <LargeIconButton
            icon=""
            offset={0}
            onClicked={() => {
                hideAllWindows()
                execAsync(config.systemCommands.restart)
            }}/>
        <LargeIconButton
            icon="⏻"
            offset={2}
            onClicked={() => {
                hideAllWindows()
                execAsync(config.systemCommands.shutdown)
            }}/>
    </box>
}