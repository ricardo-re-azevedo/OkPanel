import Wp from "gi://AstalWp"
import {bind, Binding, Variable} from "astal"
import {Gtk} from "astal/gtk4"
import LargeIconButton from "../common/LargeIconButton";
import {toggleMuteEndpoint} from "../utils/audio";
import {insertNewlines} from "../utils/strings";

/**
 * An Endpoint is either a speaker or microphone
 *
 * @param defaultEndpoint either [Wp.Audio.default_speaker] or [Wp.Audio.default_microphone]
 * @param getIcon function that takes an Endpoint and returns the proper string icon
 * @param endpointsBinding binding obtained via [bind(Wp.Audio, "speakers")] or [bind(Wp.Audio, "microphones"]
 * @param devicesLabel header shown above the device list
 */
export default function (
    {
        defaultEndpoint,
        getIcon,
        endpointsBinding,
        devicesLabel
    }: {
        defaultEndpoint: Wp.Endpoint,
        getIcon: (endpoint: Wp.Endpoint) => string,
        endpointsBinding: Binding<Wp.Endpoint[]>,
        devicesLabel: string
    }
) {
    const endpointLabelVar = Variable.derive([
        bind(defaultEndpoint, "description"),
        bind(defaultEndpoint, "volume"),
        bind(defaultEndpoint, "mute")
    ])

    return <box
        vertical={true}
        spacing={4}>
        <box
            vertical={false}>
            <LargeIconButton
                offset={0}
                icon={endpointLabelVar(() => getIcon(defaultEndpoint))}
                onClicked={() => {
                    toggleMuteEndpoint(defaultEndpoint)
                }}/>
            <box marginEnd={10}/>
            <slider
                marginTop={4}
                cssClasses={["systemMenuVolumeProgress"]}
                hexpand={true}
                onChangeValue={({value}) => {
                    defaultEndpoint.volume = value
                }}
                value={bind(defaultEndpoint, "volume")}
            />
        </box>
        <label
            marginTop={10}
            halign={Gtk.Align.START}
            label={devicesLabel}
            cssClasses={["labelLargeBold"]}/>
        <box
            vertical={true}>
            {endpointsBinding.as((endpoints) => {
                if (endpoints.length === 0) {
                    return <label
                        cssClasses={["labelMedium"]}
                        label="No devices"/>
                }
                return endpoints.map((endpoint) => {
                    return <button
                        hexpand={true}
                        cssClasses={bind(endpoint, "isDefault").as((isDefault) => {
                            return isDefault ? ["primaryButton"] : ["transparentButton"]
                        })}
                        onClicked={() => {
                            endpoint.set_is_default(true)
                        }}>
                        <label
                            halign={Gtk.Align.START}
                            xalign={0}
                            cssClasses={["labelSmall"]}
                            label={bind(endpoint, "description").as((description) => insertNewlines(description, 38))} // wrap causes issues with scrollable height so split lines manually
                        />
                    </button>
                })
            })}
        </box>
    </box>
}
