import Wp from "gi://AstalWp"
import {bind, Variable} from "astal";
import {getMicrophoneIcon, getVolumeIcon} from "../../utils/audio";
import {toggleWindow} from "../../utils/windows";
import ScrimScrollWindow from "../../common/ScrimScrollWindow";
import {config, selectedBar} from "../../../config/config";
import {Bar} from "../../../config/bar";
import {BarWidget} from "../../../config/configSchema";
import EndpointControls from "../../systemMenu/EndpointControls";

export const AudioOutWindowName = "audioOutMenuWindow"
export const AudioInWindowName = "audioInMenuWindow"

export function AudioOutIndicator() {
    const defaultSpeaker = Wp.get_default()!.audio.default_speaker

    const speakerVar = Variable.derive([
        bind(defaultSpeaker, "description"),
        bind(defaultSpeaker, "volume"),
        bind(defaultSpeaker, "mute")
    ])

    return <button
        cssClasses={["iconButton"]}
        label={speakerVar(() => getVolumeIcon(defaultSpeaker))}
        onClicked={() => {
            toggleWindow(AudioOutWindowName)
        }}/>
}

export function AudioInIndicator() {
    const {defaultMicrophone} = Wp.get_default()!.audio

    const micVar = Variable.derive([
        bind(defaultMicrophone, "description"),
        bind(defaultMicrophone, "volume"),
        bind(defaultMicrophone, "mute")
    ])

    return <button
        cssClasses={["iconButton"]}
        label={micVar(() => getMicrophoneIcon(defaultMicrophone))}
        onClicked={() => {
            toggleWindow(AudioInWindowName)
        }}/>
}

function AudioMenu(
    {
        windowName,
        content
    }: {
        windowName: string,
        content: JSX.Element
    }
) {
    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={windowName}
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
                {content}
            </box>
        }/>
}

export function AudioOutMenu() {
    const {audio} = Wp.get_default()!

    return <AudioMenu
        windowName={AudioOutWindowName}
        content={
            <EndpointControls
                defaultEndpoint={audio.default_speaker}
                endpointsBinding={bind(audio, "speakers")}
                getIcon={getVolumeIcon}
                devicesLabel="Output devices"/>
        }/>
}

export function AudioInMenu() {
    const {audio} = Wp.get_default()!

    return <AudioMenu
        windowName={AudioInWindowName}
        content={
            <EndpointControls
                defaultEndpoint={audio.default_microphone}
                endpointsBinding={bind(audio, "microphones")}
                getIcon={getMicrophoneIcon}
                devicesLabel="Input devices"/>
        }/>
}
