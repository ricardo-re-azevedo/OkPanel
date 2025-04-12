import {App, Astal, Gdk, Gtk} from "astal/gtk4"
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
import {Bar, selectedBar} from "../bar/Bar";
import {BarWidget, config} from "../utils/config/config";
import ScrimScrollWindow from "../common/ScrimScrollWindow";

export const SystemMenuWindowName = "systemMenuWindow"

export default function () {
    const {audio} = Wp.get_default()!

    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={SystemMenuWindowName}
        anchor={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    if (config.horizontalBar.leftWidgets.includes(BarWidget.MENU)) {
                        return Astal.WindowAnchor.TOP
                            | Astal.WindowAnchor.LEFT
                            | Astal.WindowAnchor.BOTTOM
                    } else if (config.horizontalBar.centerWidgets.includes(BarWidget.MENU)) {
                        return Astal.WindowAnchor.TOP
                            | Astal.WindowAnchor.BOTTOM
                    } else {
                        return Astal.WindowAnchor.TOP
                            | Astal.WindowAnchor.RIGHT
                            | Astal.WindowAnchor.BOTTOM
                    }
                case Bar.LEFT:
                    return Astal.WindowAnchor.TOP
                        | Astal.WindowAnchor.LEFT
                        | Astal.WindowAnchor.BOTTOM
                case Bar.RIGHT:
                    return Astal.WindowAnchor.TOP
                        | Astal.WindowAnchor.RIGHT
                        | Astal.WindowAnchor.BOTTOM
            }
        })}
        topExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.BOTTOM:
                    return true
                case Bar.LEFT:
                case Bar.RIGHT:
                    return config.verticalBar.centerWidgets.includes(BarWidget.MENU)
                        || config.verticalBar.bottomWidgets.includes(BarWidget.MENU)
                default: return false
            }
        })}
        bottomExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    return true
                case Bar.LEFT:
                case Bar.RIGHT:
                    return config.verticalBar.centerWidgets.includes(BarWidget.MENU)
                        || config.verticalBar.topWidgets.includes(BarWidget.MENU)
                default: return false
            }
        })}
        width={400}
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