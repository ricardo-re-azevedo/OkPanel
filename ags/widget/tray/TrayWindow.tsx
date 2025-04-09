import {App, Astal, Gdk, Gtk} from "astal/gtk4";
import {BarWidget, config} from "../utils/config/config";
import {Bar, selectedBar} from "../bar/Bar";
import Tray from "gi://AstalTray"
import {bind} from "astal";

export const TrayWindowName = "trayWindow"
const tray = Tray.get_default()

function Content() {
    return <box
        vertical={true}>
        {bind(tray, "items").as((items) => {
            return items.map((item) => {
                let ag_handler: number;

                return <box
                    marginStart={8}
                    marginEnd={8}
                    marginTop={8}
                    marginBottom={8}
                    vertical={true}
                    spacing={8}>
                    <menubutton
                        cssClasses={["trayMenuButton"]}
                        tooltipMarkup={bind(item, "tooltipMarkup")}
                        menuModel={bind(item, "menuModel")}
                        onDestroy={() => item.disconnect(ag_handler)}
                        setup={self => {
                            ag_handler = item.connect("notify::action-group", () => {
                                self.insert_action_group("dbusmenu", item.get_action_group())
                            })
                        }}>
                        <label label={item.title}/>
                    </menubutton>
                </box>
            })
        })}
    </box>
}

export function TrayPopover() {
    return <popover
        position={Gtk.PositionType.RIGHT}>
        <Content/>
    </popover>
}

export default function () {
    let window: Astal.Window | null = null
    bind(tray, "items").subscribe((items) => {
        if (items.length === 0) {
            window?.hide()
        }
    })

    return <window
        monitor={0}
        cssClasses={["focusedWindow"]}
        name={TrayWindowName}
        application={App}
        anchor={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    if (config.horizontalBar.leftWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT
                    } else if (config.horizontalBar.centerWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.TOP
                    } else {
                        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT
                    }
                case Bar.LEFT:
                    if (config.verticalBar.topWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP
                    } else if (config.verticalBar.centerWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.LEFT
                    } else {
                        return Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM
                    }
                case Bar.RIGHT:
                    if (config.verticalBar.topWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP
                    } else if (config.verticalBar.centerWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.RIGHT
                    } else {
                        return Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM
                    }
                case Bar.BOTTOM:
                    if (config.horizontalBar.leftWidgets.includes(BarWidget.TRAY)) {
                        return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT
                    } else if (config.horizontalBar.centerWidgets.includes(BarWidget.TRAY)) {
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
        }}
        setup={(self) => {
            window = self
        }}>
        <Content/>
    </window>
}