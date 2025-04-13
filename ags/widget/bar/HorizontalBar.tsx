import {App, Astal, Gdk, Gtk} from "astal/gtk4"
import {addWidgets} from "./BarWidgets";
import {Bar, selectedBar} from "./Bar";
import {config} from "../utils/config/config";

export default function () {
    return <window
        visible={selectedBar((bar) => {
            return bar === Bar.TOP || bar === Bar.BOTTOM
        })}
        cssClasses={["transparentBackground"]}
        monitor={config.mainMonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        margin={config.windows.gaps}
        anchor={selectedBar((bar) => {
            if (bar === Bar.TOP) {
                if (!config.horizontalBar.expanded) {
                    return Astal.WindowAnchor.TOP
                }
                return Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.LEFT
                    | Astal.WindowAnchor.RIGHT
            } else {
                if (!config.horizontalBar.expanded) {
                    return Astal.WindowAnchor.BOTTOM
                }
                return Astal.WindowAnchor.BOTTOM
                    | Astal.WindowAnchor.LEFT
                    | Astal.WindowAnchor.RIGHT
            }
        })}
        application={App}>
        <centerbox
            orientation={Gtk.Orientation.HORIZONTAL}
            cssClasses={config.horizontalBar.splitSections ? ["topBar"] : ["window", "topBar"]}>
            <box
                visible={config.horizontalBar.leftWidgets.length > 0}
                halign={Gtk.Align.START}
                cssClasses={config.horizontalBar.splitSections ? ["window"] : []}>
                {addWidgets(config.horizontalBar.leftWidgets, false)}
            </box>
            <box
                visible={config.horizontalBar.centerWidgets.length > 0}
                cssClasses={config.horizontalBar.splitSections ? ["window"] : []}>
                {addWidgets(config.horizontalBar.centerWidgets, false)}
            </box>
            <box
                visible={config.horizontalBar.rightWidgets.length > 0}
                halign={Gtk.Align.END}
                cssClasses={config.horizontalBar.splitSections ? ["window"] : []}>
                {addWidgets(config.horizontalBar.rightWidgets, false)}
            </box>
        </centerbox>
    </window>
}
