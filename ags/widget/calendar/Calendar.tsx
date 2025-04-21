import {Gtk} from "astal/gtk4"
import {GLib, Variable} from "astal"
import {Bar, selectedBar} from "../bar/Bar";
import {config} from "../utils/config/config";
import ScrimScrollWindow from "../common/ScrimScrollWindow";
import {BarWidget} from "../utils/config/newConfig";

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
                case Bar.LEFT:
                case Bar.RIGHT:
                    return config.verticalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.verticalBar.bottomWidgets.includes(BarWidget.CLOCK)
                default: return false
            }
        })}
        bottomExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    return true
                case Bar.LEFT:
                case Bar.RIGHT:
                    return config.verticalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.verticalBar.topWidgets.includes(BarWidget.CLOCK)
                default: return false
            }
        })}
        leftExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.RIGHT:
                    return true
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.rightWidgets.includes(BarWidget.CLOCK)
                default: return false
            }
        })}
        rightExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.LEFT:
                    return true
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
                        return t.format("%A")!
                    })}/>
                <label
                    cssClasses={["labelMedium"]}
                    label={time().as((t) => {
                        return t.format("%B %-d, %Y")!
                    })}/>
                <Gtk.Calendar
                    marginTop={12}
                    cssClasses={["calendar"]}/>
            </box>
        }/>
}