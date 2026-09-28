import {bind, Variable} from "astal"
import {Gtk, App, astalify} from "astal/gtk4"
import {execAsync} from "astal/process"
import {BluetoothWindowName} from "./Bluetooth"
import {getBluetoothName} from "../../utils/bluetooth";
import Bluetooth from "gi://AstalBluetooth";

const Spinner = astalify<Gtk.Spinner, Gtk.Spinner.ConstructorProps>(Gtk.Spinner)

function BluetoothSavedDevices() {
    const bluetooth = Bluetooth.get_default()

    return <box
        vertical={true}>
        {bind(bluetooth, "devices").as((devices) => {
            return devices.filter((device) => {
                return device.name != null
            }).map((device) => {
                return <box
                    vertical={false}
                    visible={bind(device, "paired")}>
                    <button
                        hexpand={true}
                        cssClasses={bind(device, "connected").as((connected) => {
                            return connected ? ["primaryButton"] : ["transparentButton"]
                        })}
                        onClicked={() => {
                            if (device.connecting) {
                                // do nothing
                            } else if (device.connected) {
                                device.disconnect_device((device, result, data) => {
                                    print("disconnected")
                                })
                            } else {
                                device.connect_device((device, result, data) => {
                                    print("connected")
                                })
                            }
                        }}>
                        <box
                            spacing={8}>
                            <label
                                halign={Gtk.Align.START}
                                hexpand={true}
                                cssClasses={["labelSmall"]}
                                label={`  ${device.name}`}/>
                            <Spinner
                                visible={bind(device, "connecting")}
                                spinning={bind(device, "connecting")}/>
                        </box>
                    </button>
                    <button
                        cssClasses={["iconButton"]}
                        marginStart={4}
                        label="󰆴"
                        tooltipText="Unpair"
                        onClicked={() => {
                            device.set_trusted(false)
                            bluetooth.adapter?.remove_device(device)
                        }}/>
                </box>
            })
        })}
    </box>
}

function BluetoothDevices() {
    const bluetooth = Bluetooth.get_default()

    return <box
        vertical={true}>
        {bind(bluetooth, "devices").as((devices) => {
            if (devices.length === 0) {
                return <label
                    cssClasses={["labelMedium"]}
                    label="No devices"/>
            }
            return devices.filter((device) => {
                return device.name != null
            }).map((device) => {
                const buttonsRevealed = Variable(false)
                const pairing = Variable(false)

                setTimeout(() => {
                    bind(App.get_window(BluetoothWindowName)!, "visible").subscribe((visible) => {
                        if (!visible) {
                            buttonsRevealed.set(false)
                        }
                    })
                }, 1_000)

                return <box
                    vertical={true}
                    visible={bind(device, "paired").as((paired) => !paired)}>
                    <button
                        hexpand={true}
                        cssClasses={["transparentButton"]}
                        onClicked={() => {
                            buttonsRevealed.set(!buttonsRevealed.get())
                        }}>
                        <label
                            halign={Gtk.Align.START}
                            cssClasses={["labelSmall"]}
                            label={`  ${device.name}`}/>
                    </button>
                    <revealer
                        revealChild={buttonsRevealed()}
                        transitionDuration={200}
                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                        <box
                            vertical={true}>
                            <button
                                hexpand={true}
                                cssClasses={["primaryButton"]}
                                marginTop={4}
                                marginBottom={4}
                                onClicked={() => {
                                    if (pairing.get()) {
                                        return
                                    }
                                    // device.pair() is synchronous and blocks the UI, so make the same dbus call through busctl.
                                    // bluetoothctl can't be used here because it doesn't register a pairing agent when non-interactive.
                                    pairing.set(true)
                                    const devicePath = `/org/bluez/hci0/dev_${device.address.replaceAll(":", "_")}`
                                    execAsync(["busctl", "call", "--timeout=60", "org.bluez", devicePath, "org.bluez.Device1", "Pair"])
                                        .then(() => {
                                            device.set_trusted(true)
                                        })
                                        .catch((error) => {
                                            print(error)
                                        })
                                        .finally(() => {
                                            pairing.set(false)
                                        })
                                }}>
                                <box
                                    halign={Gtk.Align.CENTER}
                                    spacing={8}>
                                    <Spinner
                                        visible={pairing()}
                                        spinning={pairing()}/>
                                    <label
                                        label={pairing((isPairing) => {
                                            return isPairing ? "Pairing" : "Pair"
                                        })}/>
                                </box>
                            </button>
                        </box>
                    </revealer>
                </box>
            })
        })}
    </box>
}

export default function () {
    const bluetooth = Bluetooth.get_default()

    return <box
        vertical={true}
        spacing={4}>
            <box
                vertical={false}>
                <label
                    cssClasses={["labelMediumBold"]}
                    halign={Gtk.Align.START}
                    hexpand={true}
                    label={bind(bluetooth, "adapters").as(() => getBluetoothName())}/>
                <button
                    cssClasses={["iconButton"]}
                    label={"⏻"}
                    onClicked={() => {
                        bluetooth.toggle()
                    }}/>
            </box>
            <box
                marginTop={10}
                vertical={true}
                visible={bind(bluetooth, "isPowered").as((isPowered) => {
                    return isPowered
                })}>
                <label
                    halign={Gtk.Align.START}
                    label="Saved devices"
                    cssClasses={["labelLargeBold"]}/>
                <BluetoothSavedDevices/>
                <box
                    marginTop={10}
                    vertical={false}>
                    <label
                        halign={Gtk.Align.START}
                        hexpand={true}
                        label="Available devices"
                        cssClasses={["labelLargeBold"]}/>
                    {/*adapter is null when bluetoothd isn't running*/}
                    {bind(bluetooth, "adapters").as(() => {
                        const adapter = bluetooth.adapter
                        if (adapter == null) {
                            return <box/>
                        }
                        return <button
                            cssClasses={["transparentButton"]}
                            marginStart={8}
                            marginEnd={8}
                            label={bind(adapter, "discovering").as((discovering) => {
                                return discovering ? "Stop scanning" : "Scan"
                            })}
                            onClicked={() => {
                                if (adapter.discovering) {
                                    adapter.stop_discovery()
                                } else {
                                    adapter.start_discovery()
                                }
                            }}/>
                    })}
                </box>
                <BluetoothDevices/>
            </box>
        </box>
}