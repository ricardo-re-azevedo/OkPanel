import {bind} from 'astal';
import {App, Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import {config} from "../../config/config";
import {SystemMenuWindowName} from "./SystemMenuWindow";
import LargeIconButton from "../common/LargeIconButton";
import {hideAllWindows} from "../utils/windows";
import {Variable} from "astal";

export default function () {

    const revealed = Variable(false)

    setTimeout(() => {
        bind(App.get_window(SystemMenuWindowName)!, "visible").subscribe((visible) => {
            if (!visible) {
                revealed.set(false)
            }
        })
    }, 1_000)

    return <box
        vertical={true}>
        <box
            vertical={false}
            halign={Gtk.Align.CENTER}
            spacing={12}>
            <LargeIconButton
                icon="󰍃"
                offset={0}
                onClicked={() => {
                    hideAllWindows()
                    print(config.systemCommands.logout);
                    execAsync(config.systemCommands.logout)
                }}/>
            <LargeIconButton
                icon=""
                offset={0}
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
                offset={0}
                onClicked={() => {
                    hideAllWindows()
                    execAsync(config.systemCommands.shutdown)
                }}/>
        </box>
    </box>
}