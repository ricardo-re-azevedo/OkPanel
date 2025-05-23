import {bind, Variable} from "astal"
import {Gtk, App} from "astal/gtk4"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import {getBluetoothIcon, getBluetoothName} from "../utils/bluetooth";
import Bluetooth from "gi://AstalBluetooth";
import RevealerRow from "../common/RevealerRow";

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
                const connectionState = Variable.derive([
                    bind(device, "connected"),
                    bind(device, "connecting")
                ])

                setTimeout(() => {
                    bind(App.get_window(SystemMenuWindowName)!, "visible").subscribe((visible) => {
                        if (!visible) {
                            buttonsRevealed.set(false)
                        }
                    })
                }, 1_000)

                return <box
                    vertical={true}>
                    <button
                        hexpand={true}
                        cssClasses={["transparentButton"]}
                        onClicked={() => {
                            buttonsRevealed.set(!buttonsRevealed.get())
                        }}>
                        <label
                            halign={Gtk.Align.START}
                            cssClasses={["labelSmall"]}
                            label={`  ${device.name}`}/>
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
                                visible={bind(device, "paired")}
                                label={connectionState((value) => {
                                    const connected = value[0]
                                    const connecting = value[1]
                                    if (connecting) {
                                        return "Connecting"
                                    } else if (connected) {
                                        return "Disconnect"
                                    } else {
                                        return "Connect"
                                    }
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
                                }}/>
                            <button
                                hexpand={true}
                                cssClasses={["primaryButton"]}
                                marginTop={4}
                                visible={bind(device, "paired")}
                                label={bind(device, "trusted").as((trusted) => {
                                    if (trusted) {
                                        return "Untrust"
                                    } else {
                                        return "Trust"
                                    }
                                })}
                                onClicked={() => {
                                    device.set_trusted(!device.trusted)
                                }}/>
                            <button
                                hexpand={true}
                                cssClasses={["primaryButton"]}
                                marginTop={4}
                                marginBottom={4}
                                label={bind(device, "paired").as((paired) => {
                                    return paired ? "Unpair" : "Pair"
                                })}
                                onClicked={() => {
                                    if (device.paired) {
                                        bluetooth.adapter.remove_device(device)
                                    } else {
                                        device.pair()
                                    }
                                }}/>
                        </box>
                    </revealer>
                </box>
            })
        })}
    </box>
}

export default function () {
    const bluetooth = Bluetooth.get_default()

    return <RevealerRow
        visible={bind(bluetooth, "isPowered")}
        icon={getBluetoothIcon()}
        iconOffset={0}
        windowName={SystemMenuWindowName}
        content={
            <label
                cssClasses={["labelMediumBold"]}
                halign={Gtk.Align.START}
                hexpand={true}
                label={getBluetoothName()}/>
        }
        revealedContent={
            <box
                marginTop={10}
                vertical={true}>
                <box
                    vertical={false}>
                    <label
                        halign={Gtk.Align.START}
                        hexpand={true}
                        label="Devices"
                        cssClasses={["labelLargeBold"]}/>
                    <button
                        cssClasses={["transparentButton"]}
                        marginStart={8}
                        marginEnd={8}
                        label={bind(bluetooth.adapter, "discovering").as((discovering) => {
                            return discovering ? "Stop scanning" : "Scan"
                        })}
                        onClicked={() => {
                            if (bluetooth.adapter.discovering) {
                                bluetooth.adapter.stop_discovery()
                            } else {
                                bluetooth.adapter.start_discovery()
                            }
                        }}/>
                </box>
                <BluetoothDevices/>
            </box>
        }
    />
}