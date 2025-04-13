import {App, Astal, Gdk, Gtk} from "astal/gtk4";
import {Variable} from "astal";
import {hideAllWindows} from "../utils/windows";

export const scrimsVisible = Variable(false)

export default function (gdkMonitor: Gdk.Monitor) {
    return <window
        gdkmonitor={gdkMonitor}
        anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP}
        exclusivity={Astal.Exclusivity.IGNORE}
        layer={Astal.Layer.TOP}
        cssClasses={["scrimBackground"]}
        application={App}
        visible={scrimsVisible()}
        setup={(self) => {
            const gesture = new Gtk.GestureClick()
            gesture.connect('pressed', (_gesture, n_press, x, y) => {
                hideAllWindows()
            });
            self.add_controller(gesture)
        }}>
        <box
            hexpand={true}
            vexpand={true}/>
    </window>
}