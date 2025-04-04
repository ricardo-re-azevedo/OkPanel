import {App, Astal, Gtk} from "astal/gtk4"
import {addWidgets} from "./BarWidgets";
import {Bar, selectedBar} from "./Bar";
import {config} from "../utils/config/config";

export default function () {
    return <window
        visible={selectedBar((bar) => {
            return bar === Bar.TOP || bar === Bar.BOTTOM
        })}
        cssClasses={["transparentBackground"]}
        monitor={0}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        margin={config.gaps}
        anchor={selectedBar((bar) => {
            if (bar === Bar.TOP) {
                return Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.LEFT
                    | Astal.WindowAnchor.RIGHT
            } else {
                return Astal.WindowAnchor.BOTTOM
                    | Astal.WindowAnchor.LEFT
                    | Astal.WindowAnchor.RIGHT
            }
        })}
        application={App}>
        <centerbox
            orientation={Gtk.Orientation.HORIZONTAL}
            cssClasses={["window", "topBar"]}>
            <box halign={Gtk.Align.START}>
                {addWidgets(config.horizontalBar.leftWidgets, false)}
            </box>
            <box>
                {addWidgets(config.horizontalBar.centerWidgets, false)}
            </box>
            <box halign={Gtk.Align.END}>
                {addWidgets(config.horizontalBar.rightWidgets, false)}
            </box>
        </centerbox>
    </window>
}
