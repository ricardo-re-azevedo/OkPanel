import {bind, GLib, Variable} from "astal"
import Hyprland from "gi://AstalHyprland"
import {CalendarWindowName} from "../calendar/Calendar"
import Wp from "gi://AstalWp"
import Battery from "gi://AstalBattery"
import {getMicrophoneIcon, getVolumeIcon, playBatteryWarning} from "../utils/audio"
import {getNetworkIconBinding} from "../utils/network"
import {getBatteryIcon} from "../utils/battery"
import {execAsync} from "astal/process"
import {SystemMenuWindowName} from "../systemMenu/SystemMenuWindow";
import Bluetooth from "gi://AstalBluetooth"
import {activeVpnConnections} from "../systemMenu/NetworkControls";
import {isRecording, ScreenshotWindowName} from "../screenshot/Screenshot";
import Divider from "../common/Divider";
import {config} from "../../config/config";
import Tray from "gi://AstalTray"
import {toggleWindow} from "../utils/windows";
import {AppLauncherWindowName} from "../appLauncher/AppLauncher";
import {Gtk} from "astal/gtk4";
import {BarWidget} from "../../config/configSchema";

const tray = Tray.get_default()

function groupByProperty(
    array: Hyprland.Workspace[],
): Hyprland.Workspace[][] {
    const map = new Map<Hyprland.Monitor, Hyprland.Workspace[]>();

    array.forEach((item) => {
        const key = item.monitor;
        if (key === null) {
            return
        }
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)!.unshift(item);
    });

    return Array.from(map.values()).sort((a, b) => {
        return a[0].monitor.id - b[0].monitor.id
    });
}

function Workspaces({vertical}: { vertical: boolean }) {
    const hypr = Hyprland.get_default()

    return <box
        vertical={vertical}>
        {bind(hypr, "workspaces").as((workspaces) => {
            const groupedWorkspaces = groupByProperty(workspaces)
            return groupedWorkspaces.map((workspaceGroup, index) => {
                return <box
                    vertical={vertical}>
                    {index > 0 && index < groupedWorkspaces.length && <Divider/>}
                    {workspaceGroup.sort((a, b) => {
                        return a.id - b.id
                    }).map((workspace) => {
                        return <button
                            label={
                                bind(workspace.monitor, "activeWorkspace").as((activeWorkspace) =>
                                    activeWorkspace?.id === workspace.id ? "" : ""
                                )
                            }
                            cssClasses={["iconButton"]}
                            onClicked={() => {
                                hypr.dispatch("workspace", `${workspace.id}`)
                            }}>
                        </button>
                    })}
                </box>
            })
        })}
    </box>
}

function Clock({singleLine}: { singleLine: boolean }) {
    let format: string

    if (singleLine) {
        format = "%I:%M"
    } else {
        format = "%I\n%M"
    }

    const time = Variable<string>("").poll(1000, () =>
        GLib.DateTime.new_now_local().format(format)!)

    return <button
        cssClasses={["iconButton"]}
        label={time()}
        onClicked={() => {
            toggleWindow(CalendarWindowName)
        }}>

    </button>
}

function VpnIndicator() {
    return <label
        cssClasses={["iconLabel"]}
        label="󰯄"
        visible={activeVpnConnections().as((connections) => {
            return connections.length !== 0
        })}/>
}

function ScreenRecordingStopButton() {
    return <button
        cssClasses={["warningIconButton"]}
        label=""
        visible={isRecording()}
        onClicked={() => {
            execAsync("pkill wf-recorder")
                .catch((error) => {
                    print(error)
                })
        }}/>
}

function AudioOut() {
    const defaultSpeaker = Wp.get_default()!.audio.default_speaker

    const speakerVar = Variable.derive([
        bind(defaultSpeaker, "description"),
        bind(defaultSpeaker, "volume"),
        bind(defaultSpeaker, "mute")
    ])

    return <label
        cssClasses={["iconLabel"]}
        label={speakerVar(() => getVolumeIcon(defaultSpeaker))}/>
}

function AudioIn() {
    const {defaultMicrophone} = Wp.get_default()!.audio

    const micVar = Variable.derive([
        bind(defaultMicrophone, "description"),
        bind(defaultMicrophone, "volume"),
        bind(defaultMicrophone, "mute")
    ])

    return <label
        cssClasses={["iconLabel"]}
        label={micVar(() => getMicrophoneIcon(defaultMicrophone))}/>
}

function BluetoothIndicator() {
    const bluetooth = Bluetooth.get_default()
    return <label
        cssClasses={["iconLabel"]}
        label="󰂯"
        visible={bind(bluetooth, "isPowered").as((isPowered) => {
            return isPowered
        })}/>
}

function NetworkIndicator() {
    return <label
        cssClasses={["iconLabel"]}
        label={getNetworkIconBinding()}/>
}

function BatteryIndicator() {
    const battery = Battery.get_default()

    let batteryWarningInterval: GLib.Source | null = null

    const batteryVar = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "state")
    ])

    return <label
        cssClasses={batteryVar((value) => {
            if (value[0] > 0.04 || battery.state === Battery.State.CHARGING) {
                if (batteryWarningInterval != null) {
                    batteryWarningInterval.destroy()
                    batteryWarningInterval = null
                }
                return ["iconLabel"]
            } else {
                if (batteryWarningInterval === null && battery.isBattery) {
                    batteryWarningInterval = setInterval(() => {
                        playBatteryWarning()
                    }, 120_000)
                    playBatteryWarning()
                }
                return ["warningIconLabel"]
            }
        })}
        label={batteryVar(() => getBatteryIcon(battery))}
        visible={bind(battery, "isBattery")}/>
}

function MenuButton() {
    return <button
        cssClasses={["iconButton"]}
        label={config.systemMenu.menuButtonIcon}
        onClicked={() => {
            toggleWindow(SystemMenuWindowName)
        }}/>
}

function IntegratedTray({vertical}: { vertical: boolean }) {
    return <TrayContent vertical={vertical}/>
}

function TrayButton() {
    return <menubutton
        visible={bind(tray, "items").as((items) => items.length > 0)}
        cssClasses={["trayIconButton"]}>
        <label label="󱊔"/>
        <popover
            position={Gtk.PositionType.RIGHT}>
            <TrayContent vertical={false}/>
        </popover>
    </menubutton>
}

function TrayContent({vertical}: { vertical: boolean }) {
    return <box
        vertical={vertical}
        visible={bind(tray, "items").as((items) => items.length > 0)}>
        {bind(tray, "items").as((items) => {
            return items.map((item) => {
                let ag_handler: number;

                return <menubutton
                    cssClasses={["trayMenuButton"]}
                    tooltipMarkup={bind(item, "tooltipMarkup")}
                    menuModel={bind(item, "menuModel")}
                    onDestroy={() => item.disconnect(ag_handler)}
                    setup={self => {
                        ag_handler = item.connect("notify::action-group", () => {
                            self.insert_action_group("dbusmenu", item.get_action_group())
                        })
                    }}>
                    <image gicon={bind(item, "gicon")}/>
                </menubutton>
            })
        })}
    </box>
}

function AppLauncherButton() {
    return <button
        cssClasses={["iconButton"]}
        label="󰀻"
        onClicked={() => {
            toggleWindow(AppLauncherWindowName)
        }}/>
}

function ScreenshotButton() {
    return <button
        cssClasses={["iconButton"]}
        label="󰹑"
        onClicked={() => {
            toggleWindow(ScreenshotWindowName)
        }}/>
}

export function addWidgets(widgets: BarWidget[], isVertical: boolean) {
    return widgets.map((widget) => {
        switch (widget) {
            case BarWidget.MENU:
                return <MenuButton/>
            case BarWidget.WORKSPACES:
                return <Workspaces vertical={isVertical}/>
            case BarWidget.BATTERY:
                return <BatteryIndicator/>
            case BarWidget.AUDIO_IN:
                return <AudioIn/>
            case BarWidget.AUDIO_OUT:
                return <AudioOut/>
            case BarWidget.BLUETOOTH:
                return <BluetoothIndicator/>
            case BarWidget.CLOCK:
                return <Clock singleLine={!isVertical}/>
            case BarWidget.NETWORK:
                return <NetworkIndicator/>
            case BarWidget.RECORDING_INDICATOR:
                return <ScreenRecordingStopButton/>
            case BarWidget.VPN_INDICATOR:
                return <VpnIndicator/>
            case BarWidget.TRAY:
                return <TrayButton/>
            case BarWidget.INTEGRATED_TRAY:
                return <IntegratedTray vertical={isVertical}/>
            case BarWidget.APP_LAUNCHER:
                return <AppLauncherButton/>
            case BarWidget.SCREENSHOT:
                return <ScreenshotButton/>
        }
    })
}
