import Bluetooth from "gi://AstalBluetooth";
import {bind} from "astal";
import {toggleWindow} from "../../utils/windows";
import ScrimScrollWindow from "../../common/ScrimScrollWindow";
import {config, selectedBar} from "../../../config/config";
import {Bar} from "../../../config/bar";
import {BarWidget} from "../../../config/configSchema";
import BluetoothOptions from "./BluetoothOptions";


export const BluetoothWindowName = "bluetoothMenuWindow"

export function BluetoothIndicator() {
    const bluetooth = Bluetooth.get_default()
    return <button
        cssClasses={["iconButton"]}
        label="󰂯"
        //visible={bind(bluetooth, "isPowered").as((isPowered) => {
        //    return isPowered
        //})}
        onClicked={() => {
            toggleWindow(BluetoothWindowName)
        }}
    />
}

export function BluetoothMenu() {
    // @ts-ignore
    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={BluetoothWindowName}
        topExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.BOTTOM:
                    return true
                default:
                    return false
            }
        })}
        bottomExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    return true
                default:
                    return false
            }
        })}
        leftExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.rightWidgets.includes(BarWidget.CLOCK)
                default:
                    return false
            }
        })}
        rightExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.leftWidgets.includes(BarWidget.CLOCK)
                default:
                    return false
            }
        })}
        contentWidth={340}
        width={config.horizontalBar.minimumWidth}
        height={config.verticalBar.minimumHeight}
        content={
            <box
                cssClasses={["calendarBox"]}
                vertical={true}>
                <BluetoothOptions/>
            </box>
        }/>
}