import {Astal, Gtk} from "astal/gtk4"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"
import {type Subscribable} from "astal/binding"
import {bind, GLib, Variable} from "astal"
import {config} from "../../config/config";
import Hyprland from "gi://AstalHyprland"
import {NotificationsPosition} from "../../config/configSchema";

// see comment below in constructor
const TIMEOUT_DELAY = 7_000

// The purpose if this class is to replace Variable<Array<Widget>>
// with a Map<number, Widget> type in order to track notification widgets
// by their id, while making it conviniently bindable as an array
class NotificationMap implements Subscribable {
    // the underlying map to keep track of id widget pairs
    private map: Map<number, Gtk.Widget> = new Map()

    // it makes sense to use a Variable under the hood and use its
    // reactivity implementation instead of keeping track of subscribers ourselves
    private var: Variable<Array<Gtk.Widget>> = Variable([])

    // notify subscribers to rerender when state changes
    private notifiy() {
        this.var.set([...this.map.values()].reverse())
    }

    constructor() {
        const notifd = Notifd.get_default()

        /**
         * uncomment this if you want to
         * ignore timeout by senders and enforce our own timeout
         * note that if the notification has any actions
         * they might not work, since the sender already treats them as resolved
         */
        // notifd.ignoreTimeout = true

        notifd.connect("notified", (_, id) => {
            let hideTimeout: GLib.Source | null = null

            if (notifd.dontDisturb) {
                return
            }

            this.set(id, Notification({
                notification: notifd.get_notification(id)!,

                // once hovering over the notification is done
                // destroy the widget without calling notification.dismiss()
                // so that it acts as a "popup" and we can still display it
                // in a notification center like widget
                // but clicking on the close button will close it
                onHoverLost: () => {
                    hideTimeout = setTimeout(() => {
                        this.delete(id)
                        hideTimeout?.destroy()
                        hideTimeout = null
                    }, TIMEOUT_DELAY)
                },
                onHover() {
                    hideTimeout?.destroy()
                    hideTimeout = null
                },

                // notifd by default does not close notifications
                // until user input or the timeout specified by sender
                // which we set to ignore above
                setup: () => {
                    hideTimeout = setTimeout(() => {
                        this.delete(id)
                        hideTimeout?.destroy()
                        hideTimeout = null
                    }, TIMEOUT_DELAY)
                },
                useHistoryCss: false
            }))
        })

        // notifications can be closed by the outside before
        // any user input, which have to be handled too
        notifd.connect("resolved", (_, id) => {
            this.delete(id)
        })
    }

    private set(key: number, value: Gtk.Widget) {
        // in case of replacecment destroy previous widget
        // destroy doesn't exist in GTK 3.  Just commenting out
        // this.map.get(key)?.destroy()
        this.map.set(key, value)
        this.notifiy()
    }

    private delete(key: number) {
        // destroy doesn't exist in GTK 3.  Just commenting out
        // this.map.get(key)?.destroy()
        this.map.delete(key)
        this.notifiy()
    }

    // needed by the Subscribable interface
    get() {
        return this.var.get()
    }

    // needed by the Subscribable interface
    subscribe(callback: (list: Array<Gtk.Widget>) => void) {
        return this.var.subscribe(callback)
    }
}

function getAnchor() {
    if (config.notifications.position === NotificationsPosition.LEFT) {
        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT
    } else if (config.notifications.position === NotificationsPosition.RIGHT) {
        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT
    } else {
        return Astal.WindowAnchor.TOP
    }
}

function getExclusivity() {
    if (config.notifications.respectExclusive) {
        return Astal.Exclusivity.NORMAL
    } else {
        return Astal.Exclusivity.IGNORE
    }
}

export default function NotificationPopups(monitor: Hyprland.Monitor): Astal.Window {
    const notifs = new NotificationMap()

    return <window
        visible={bind(notifs).as((values) => {
            return values.length !== 0
        })}
        cssClasses={["NotificationPopups"]}
        monitor={monitor.id}
        exclusivity={getExclusivity()}
        layer={Astal.Layer.OVERLAY}
        anchor={getAnchor()}>
        <box
            vertical={true}>
            {bind(notifs)}
        </box>
    </window> as Astal.Window
}
