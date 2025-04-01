import {App, Gtk} from "astal/gtk4"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import {execAsync} from "astal/process"
import {Config} from "../utils/config/parser";

export default function ({config}: {config: Config}) {
    return <box
        vertical={false}
        cssClasses={["row"]}
        halign={Gtk.Align.CENTER}>
        <button
            cssClasses={["systemMenuIconButton"]}
            label="󰍃"
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.logout)
            }}/>
        <button
            cssClasses={["systemMenuIconButton"]}
            label=""
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.lock)
            }}/>
        <button
            cssClasses={["systemMenuIconButton"]}
            label=""
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.restart)
            }}/>
        <button
            cssClasses={["systemMenuIconButton"]}
            label="⏻"
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync(config.systemCommands.shutdown)
            }}/>
    </box>
}