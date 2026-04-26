import {bind, GLib, Variable} from "astal"
import Battery from "gi://AstalBattery"
import {getBatteryIcon, getBatteryTooltip} from "../../utils/battery"
import {config, selectedBar} from "../../../config/config";
import {toggleWindow} from "../../utils/windows";
import ScrimScrollWindow from "../../common/ScrimScrollWindow";
import {Bar} from "../../../config/bar";
import {BarWidget} from "../../../config/configSchema";
import PowerModes from "./BatteryPowerOptions"

export const BatteryWindowName = "batteryMenuWindow"

export function BatteryIndicator() {
    const battery = Battery.get_default()

    const batteryVar = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "timeToFull"),
        bind(battery, "timeToEmpty"),
        bind(battery, "state")
    ])

    return <button
        cssClasses={["iconButton"]}
        label={batteryVar(() => getBatteryIcon(battery))}
        tooltipText={batteryVar(() => getBatteryTooltip(battery))}
        visible={bind(battery, "isBattery")}
        onClicked={() => {
            toggleWindow(BatteryWindowName)
        }}/>
}

export function BatteryMenu() {
    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={BatteryWindowName}
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
                <PowerModes/>
            </box>
        }/>
}