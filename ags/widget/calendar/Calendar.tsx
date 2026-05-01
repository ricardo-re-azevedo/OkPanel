import {Gtk} from "astal/gtk4"
import {GLib, Variable} from "astal"
import {config, selectedBar} from "../../config/config";
import ScrimScrollWindow from "../common/ScrimScrollWindow";
import {BarWidget} from "../../config/configSchema";
import {Bar} from "../../config/bar";

export const CalendarWindowName = "calendarWindow"

export default function () {
    const time = Variable<GLib.DateTime>(GLib.DateTime.new_now_local())
        .poll(1000, () => GLib.DateTime.new_now_local())

    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={CalendarWindowName}
        topExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.BOTTOM:
                    return true
                default: return false
            }
        })}
        bottomExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    return true
                default: return false
            }
        })}
        leftExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.rightWidgets.includes(BarWidget.CLOCK)
                default: return false
            }
        })}
        rightExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.leftWidgets.includes(BarWidget.CLOCK)
                default: return false
            }
        })}
        contentWidth={340}
        width={config.horizontalBar.minimumWidth}
        height={config.verticalBar.minimumHeight}
        content={
            <box
                cssClasses={["calendarBox"]}
                vertical={true}>
                <label
                    cssClasses={["labelMedium"]}
                    label={time().as((t) => {
                        return t.format("%A %B %-d, %Y")!
                    })}/>
                <Gtk.Calendar
                    marginTop={12}
                    cssClasses={["calendar"]}/>
            </box>
        }/>
}