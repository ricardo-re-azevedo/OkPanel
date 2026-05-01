import {getNetworkIconBinding} from "../../utils/network";
import AstalNetwork from "gi://AstalNetwork";
import {bind, Binding, Variable} from "astal";
import ScrimScrollWindow from "../../common/ScrimScrollWindow";
import {config, selectedBar} from "../../../config/config";
import {Bar} from "../../../config/bar";
import {BarWidget} from "../../../config/configSchema";
import NetworkOptions from "./NetworkOptions";
import {toggleWindow} from "../../utils/windows";

export const NetworkWindowName = "networkMenuWindow"

const network = AstalNetwork.get_default()
const networkName = Variable.derive([
    bind(network.client, "primaryConnection"),
])

function currentConnection(): Binding<string> {
    return networkName().as((value) => {
        const primaryConnection = value[0]
        let name: string
        if (primaryConnection === null) {
            name = "Not Connected"
        } else if (primaryConnection.id.toLowerCase().startsWith("wired")) {
            name = "Wired"
        } else {
            name = primaryConnection.id
        }
        return name
    })
}

export function NetworkIndicator() {
    return <button
        cssClasses={["iconButton"]}
        label={getNetworkIconBinding()}
        tooltipText={currentConnection()}
        onClicked={() => {
            toggleWindow(NetworkWindowName)
            network.wifi?.scan()
        }}/>
}

export function NetworkMenu() {
    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={NetworkWindowName}
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
                <NetworkOptions/>
            </box>
        }/>
}
