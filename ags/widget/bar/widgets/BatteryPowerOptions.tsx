import PowerProfiles from "gi://AstalPowerProfiles"
import {bind} from 'astal';
import {Gtk} from "astal/gtk4"

const powerProfilesService = PowerProfiles.get_default();

export default function PowerModes() {

    const powerProfiles = powerProfilesService.get_profiles();

    return <box
        vertical={true}
        spacing={4}>
        {powerProfiles.map((powerProfile: PowerProfiles.Profile) => {

                return <button
                    hexpand={true}
                cssClasses={bind(powerProfilesService, 'activeProfile').as(
                    (active) => active === powerProfile.profile ? ['primaryButton'] : ['transparentButton']
                )}
                onClicked={() => {
                    powerProfilesService.activeProfile = powerProfile.profile;
                }}>
                <label
                    halign={Gtk.Align.START}
                cssClasses={["labelMediumBold"]}
                label={powerProfile.profile}/>
                </button>
            })}
        </box>
}