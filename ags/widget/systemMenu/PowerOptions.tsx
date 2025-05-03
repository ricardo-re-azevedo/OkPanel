import PowerProfiles from "gi://AstalPowerProfiles"
import {bind} from 'astal';
import {App, Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import {config} from "../../config/config";
import {SystemMenuWindowName} from "./SystemMenuWindow";
import LargeIconButton from "../common/LargeIconButton";
import {hideAllWindows} from "../utils/windows";
import {Variable} from "astal";

const powerProfilesService = PowerProfiles.get_default();

function PowerModes() {

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
                    cssClasses={["labelLargeBold"]}
                    label={powerProfile.profile}/>
                    </button>
                })}
        </box>
        }

        export default function () {

            const revealed = Variable(false)

            setTimeout(() => {
                bind(App.get_window(SystemMenuWindowName)!, "visible").subscribe((visible) => {
                    if (!visible) {
                        revealed.set(false)
                    }
                })
            }, 1_000)

            return <box
                vertical={true}>
                <box
                    vertical={false}
                    halign={Gtk.Align.CENTER}
                    spacing={12}>
                    <LargeIconButton
                        icon="󰍃"
                        offset={0}
                        onClicked={() => {
                            hideAllWindows()
                            execAsync(config.systemCommands.logout)
                        }}/>
                    <LargeIconButton
                        icon=""
                        offset={0}
                        onClicked={() => {
                            hideAllWindows()
                            execAsync(config.systemCommands.lock)
                        }}/>
                    <LargeIconButton
                        icon=""
                        offset={0}
                        onClicked={() => {
                            hideAllWindows()
                            execAsync(config.systemCommands.restart)
                        }}/>
                    <LargeIconButton
                        icon="⏻"
                        offset={0}
                        onClicked={() => {
                            hideAllWindows()
                            execAsync(config.systemCommands.shutdown)
                        }}/>
                    <LargeIconButton
                        icon="⚡"
                        offset={0}
                        onClicked={() => {
                            revealed.set(!revealed.get())
                        }}/>
                </box>
                <box
                    vertical={false}
                    hexpand={true}
                    halign={Gtk.Align.CENTER}
                    spacing={12}>
                    <revealer
                        marginStart={10}
                        marginEnd={10}
                        revealChild={revealed()}
                        transitionDuration={200}
                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                        <box
                            vertical={true}>
                            <PowerModes/>
                        </box>
                    </revealer>
                </box>
            </box>
        }