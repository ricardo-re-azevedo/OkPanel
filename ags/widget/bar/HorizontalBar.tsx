import {App, Astal, Gtk} from "astal/gtk4"
import {addWidgets} from "./BarWidgets";
import {config, selectedBar} from "../../config/config";

import {Bar} from "../../config/bar";

export default function () {
    return <window
        widthRequest={config.horizontalBar.minimumWidth}
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
            cssClasses={config.horizontalBar.splitSections ? ["topBar"] : ["barWindow", "topBar"]}>
            <box
                visible={config.horizontalBar.leftWidgets.length > 0}
                halign={Gtk.Align.START}
                cssClasses={config.horizontalBar.splitSections ? ["barWindow"] : []}>
                <box
                    vertical={false}
                    marginStart={config.horizontalBar.sectionPadding}
                    marginEnd={config.horizontalBar.sectionPadding}
                    spacing={config.horizontalBar.widgetSpacing}>
                    {addWidgets(config.horizontalBar.leftWidgets, false)}
                </box>
            </box>
            <box
                visible={config.horizontalBar.centerWidgets.length > 0}
                cssClasses={config.horizontalBar.splitSections ? ["barWindow"] : []}>
                <box
                    vertical={false}
                    marginStart={config.horizontalBar.sectionPadding}
                    marginEnd={config.horizontalBar.sectionPadding}
                    spacing={config.horizontalBar.widgetSpacing}>
                    {addWidgets(config.horizontalBar.centerWidgets, false)}
                </box>
            </box>
            <box
                visible={config.horizontalBar.rightWidgets.length > 0}
                halign={Gtk.Align.END}
                cssClasses={config.horizontalBar.splitSections ? ["barWindow"] : []}>
                <box
                    vertical={false}
                    marginStart={config.horizontalBar.sectionPadding}
                    marginEnd={config.horizontalBar.sectionPadding}
                    spacing={config.horizontalBar.widgetSpacing}>
                    {addWidgets(config.horizontalBar.rightWidgets, false)}
                </box>
            </box>
        </centerbox>
    </window>
}
