import {bind} from "astal"
import Brightness, {hasBacklight} from "../utils/connectables/brightness";
import {getBrightnessIcon} from "../utils/brightness";

/**
 * Screen brightness slider.  Laid out to match the header of RevealerRow so it
 * lines up with the volume and microphone rows.
 */
export default function () {
    const brightness = Brightness.get_default()

    return <box
        visible={hasBacklight}
        vertical={false}>
        <label
            marginTop={8}
            marginBottom={8}
            marginStart={18}
            marginEnd={18}
            cssClasses={["largeIconLabel"]}
            label={bind(brightness, "screen").as(() => getBrightnessIcon(brightness))}/>
        <box marginEnd={10}/>
        <box
            marginTop={4}>
            <slider
                cssClasses={["systemMenuVolumeProgress"]}
                hexpand={true}
                min={0.01}
                onChangeValue={({value}) => {
                    brightness.screen = value
                }}
                value={bind(brightness, "screen")}
            />
        </box>
        {/*invisible stand-in for RevealerRow's expand button so the slider widths line up*/}
        <button
            cssClasses={["iconButton"]}
            label=""
            opacity={0}
            sensitive={false}/>
    </box>
}
