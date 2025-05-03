import EndpointControls from "./EndpointControls";
import Wp from "gi://AstalWp"
import {bind} from "astal"
import {getMicrophoneIcon, getVolumeIcon} from "../utils/audio";
import PowerOptions from "./PowerOptions";
import MediaPlayers from "./MediaPlayers";
import NotificationHistory from "./NotificationHistory";
import NetworkControls from "./NetworkControls";
import BluetoothControls from "./BluetoothControls";
import LookAndFeelControls from "./LookAndFeelControls";
import {config, selectedBar} from "../../config/config";
import ScrimScrollWindow from "../common/ScrimScrollWindow";
import {BarWidget} from "../../config/configSchema";
import {Bar} from "../../config/bar";

export const SystemMenuWindowName = "systemMenuWindow"

export default function () {
    const {audio} = Wp.get_default()!

    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={SystemMenuWindowName}
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
                    return config.horizontalBar.centerWidgets.includes(BarWidget.MENU)
                        || config.horizontalBar.rightWidgets.includes(BarWidget.MENU)
                default: return false
            }
        })}
        rightExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.MENU)
                        || config.horizontalBar.leftWidgets.includes(BarWidget.MENU)
                default: return false
            }
        })}
        contentWidth={400}
        width={config.horizontalBar.minimumWidth}
        height={600}
        content={
            <box
                marginTop={20}
                marginStart={20}
                marginEnd={20}
                vertical={true}
                spacing={10}>
                <NetworkControls/>
                <BluetoothControls/>
                <EndpointControls
                    defaultEndpoint={audio.default_speaker}
                    endpointsBinding={bind(audio, "speakers")}
                    getIcon={getVolumeIcon}/>
                <EndpointControls
                    defaultEndpoint={audio.default_microphone}
                    endpointsBinding={bind(audio, "microphones")}
                    getIcon={getMicrophoneIcon}/>
                <LookAndFeelControls/>
                {/*MediaPlayersAstal uses the astal mpris component.  It causes UI jank.  Until it gets fix
                        use MediaPlayers.  It uses a home-made mpris component that doesn't cause the jank.*/}
                {/*<MediaPlayersAstal/>*/}
                {config.systemMenu.enableMprisWidget && <MediaPlayers/>}
                <PowerOptions/>
                <box
                    marginTop={10}
                    vertical={false}>
                    <NotificationHistory/>
                </box>
                <box marginTop={2}/>
            </box>
        }
    />
}