import {App, Astal, Gtk} from "astal/gtk4"
import {addWidgets} from "./BarWidgets";
import {selectedBar, Bar} from "./Bar";
import {config} from "../utils/config/config";

export default function () {
    return <window
        cssClasses={["transparentBackground"]}
        monitor={0}
        visible={selectedBar((bar) => {
            return bar === Bar.LEFT || bar === Bar.RIGHT
        })}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        margin={config.gaps}
        anchor={selectedBar((bar) => {
            if (bar === Bar.LEFT) {
                return Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.LEFT
                    | Astal.WindowAnchor.BOTTOM
            } else {
                return Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.RIGHT
                    | Astal.WindowAnchor.BOTTOM
            }
        })}
        application={App}>
        <centerbox
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["window", "sideBar"]}>
            <box vertical={true}>
                {addWidgets(config.verticalBar.topWidgets, true)}
            </box>
            <box vertical={true}>
                {addWidgets(config.verticalBar.centerWidgets, true)}
            </box>
            <box
                vertical={true}
                valign={Gtk.Align.END}>
                {addWidgets(config.verticalBar.bottomWidgets, true)}
            </box>
        </centerbox>
    </window>
}
