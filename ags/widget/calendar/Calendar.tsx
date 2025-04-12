import {App, Astal, Gdk, Gtk} from "astal/gtk4"
import {GLib, Variable} from "astal"
import {Bar, selectedBar} from "../bar/Bar";
import {BarWidget, config} from "../utils/config/config";

export const CalendarWindowName = "calendarWindow"

export default function () {
    const time = Variable<GLib.DateTime>(GLib.DateTime.new_now_local())
        .poll(1000, () => GLib.DateTime.new_now_local())

    return <window
        monitor={config.mainMonitor}
        cssClasses={["focusedWindow"]}
        name={CalendarWindowName}
        application={App}
        anchor={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    if (config.horizontalBar.leftWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT
                    } else if (config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.TOP
                    } else {
                        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT
                    }
                case Bar.LEFT:
                    if (config.verticalBar.topWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP
                    } else if (config.verticalBar.centerWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.LEFT
                    } else {
                        return Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM
                    }
                case Bar.RIGHT:
                    if (config.verticalBar.topWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP
                    } else if (config.verticalBar.centerWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.RIGHT
                    } else {
                        return Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM
                    }
                case Bar.BOTTOM:
                    if (config.horizontalBar.leftWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT
                    } else if (config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)) {
                        return Astal.WindowAnchor.BOTTOM
                    } else {
                        return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT
                    }
            }
        })}
        layer={Astal.Layer.TOP}
        margin={config.gaps}
        visible={false}
        keymode={Astal.Keymode.ON_DEMAND}
        onKeyPressed={function (self, key) {
            if (key === Gdk.KEY_Escape) {
                self.hide()
            }
        }}>
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
    </window>
}