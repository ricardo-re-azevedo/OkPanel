import AstalNetwork from "gi://AstalNetwork"
import {getAccessPointIcon, getNetworkIconBinding} from "../../utils/network";
import {bind, Variable} from "astal"
import {Gtk, App} from "astal/gtk4"
import {execAsync} from "astal/process"
import {NetworkWindowName} from "./Network";
import Pango from "gi://Pango?version=1.0";
import RevealerRow from "../../common/RevealerRow";
import {getBatteryIcon, getBatteryTooltip} from "../../utils/battery";
import {toggleWindow} from "../../utils/windows";
import {BatteryWindowName} from "./Battery";

const wifiConnections = Variable<string[]>([])
const inactiveWifiConnections = Variable<string[]>([])
const activeWifiConnections = Variable<string[]>([])

function ssidInRange(ssid: string) {
    const network = AstalNetwork.get_default()

    return network.wifi.accessPoints.find((accessPoint) => {
        return accessPoint.ssid === ssid
    }) != null
}

function updateConnections() {
    // update active connections
    execAsync(["bash", "-c", `nmcli -t -f NAME,TYPE connection show --active`])
        .catch((error) => {
            print(error)
        })
        .then((value) => {
            if (typeof value !== "string") {
                return
            }

            const wifiNames = value
                .split("\n")
                .filter((line) => line.includes("802-11-wireless"))
                .map((line) => line.split(":")[0].trim())
                .sort((a, b) => {
                    const aInRange = ssidInRange(a)
                    const bInRange = ssidInRange(b)
                    if (aInRange && bInRange) {
                        return 0
                    } else if (aInRange) {
                        return -1
                    } else {
                        return 1
                    }
                });

            activeWifiConnections.set(wifiNames)
        })
        .finally(() => {
            // update inactive connections
            execAsync(["bash", "-c", `nmcli -t -f NAME,TYPE connection show`])
                .catch((error) => {
                    print(error)
                })
                .then((value) => {
                    if (typeof value !== "string") {
                        return
                    }

                    const wifiNames = value
                        .split("\n")
                        .filter((line) => line.includes("802-11-wireless"))
                        .map((line) => line.split(":")[0].trim())
                        .sort((a, b) => {
                            const aInRange = ssidInRange(a)
                            const bInRange = ssidInRange(b)
                            if (aInRange && bInRange) {
                                return 0
                            } else if (aInRange) {
                                return -1
                            } else {
                                return 1
                            }
                        });

                    wifiConnections.set(wifiNames)
                    inactiveWifiConnections.set(
                        wifiNames
                            .filter((line) => !activeWifiConnections.get().includes(line))
                    )
                })
        })
}

function deleteConnection(ssid: string) {
    execAsync(["bash", "-c", `nmcli connection delete "${ssid}"`])
        .finally(() => {
            updateConnections()
        })
}

function disconnect(ssid: string) {
    execAsync(["bash", "-c", `nmcli connection down "${ssid}"`])
        .finally(() => {
            updateConnections()
        })
}


function PasswordEntry(
    {
        accessPoint,
        passwordEntryRevealed
    }: {
        accessPoint: AstalNetwork.AccessPoint,
        passwordEntryRevealed: Variable<boolean>
    }
) {
    const text = Variable("")
    const errorRevealed = Variable(false)
    const isConnecting = Variable(false)

    passwordEntryRevealed.subscribe((r) => {
        if (!r) {
            errorRevealed.set(false)
        }
    })

    const connect = () => {
        errorRevealed.set(false)
        isConnecting.set(true)
        execAsync(["bash", "-c", `echo '${text.get()}' | nmcli device wifi connect "${accessPoint.ssid}" --ask`])
            .catch((error) => {
                print(error)
                errorRevealed.set(true)
                deleteConnection(accessPoint.ssid)
            })
            .then((value) => {
                print(value)
            })
            .finally(() => {
                if (!errorRevealed.get()) {
                    passwordEntryRevealed.set(false)
                    updateConnections()
                }
                isConnecting.set(false)
            })
    }

    return <box
        marginTop={4}
    vertical={true}
    spacing={4}>
        {accessPoint.flags !== 0 && <box
                vertical={true}>
            <label
                halign={Gtk.Align.START}
            cssClasses={["labelSmall"]}
            label="Password"/>
            <entry
                cssClasses={["networkPasswordEntry"]}
            onChanged={self => text.set(self.text)}
    onActivate={() => connect()}/>
    </box>}
    <revealer
    revealChild={errorRevealed()}
    transitionDuration={200}
    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
    <label
        halign={Gtk.Align.START}
    cssClasses={["labelSmallWarning"]}
    label="Error Connecting"/>
        </revealer>
        <button
    cssClasses={["primaryButton"]}
    hexpand={true}
    label={isConnecting((connecting) => {
        if (connecting) {
            return "Connecting"
        } else {
            return "Connect"
        }
    })}
    onClicked={() => {
        if (!isConnecting.get()) {
            connect()
        }
    }}/>
    </box>
}


function WifiConnections() {
    const network = AstalNetwork.get_default()

    return <box
        vertical={true}>
        <label
            halign={Gtk.Align.START}
            cssClasses={["labelLargeBold"]}
            label="Saved networks"/>
        {inactiveWifiConnections((connectionsValue) => {
            return connectionsValue.map((connection) => {
                const buttonsRevealed = Variable(false)

                setTimeout(() => {
                    bind(App.get_window(NetworkWindowName)!, "visible").subscribe((visible) => {
                        if (!visible) {
                            buttonsRevealed.set(false)
                        }
                    })
                }, 1_000)

                let label: string
                let canConnect: boolean
                const accessPoint = network.wifi.accessPoints.find((accessPoint) => {
                    return accessPoint.ssid === connection
                })
                if (accessPoint != null) {
                    label = `${getAccessPointIcon(accessPoint)}  ${connection}`
                    canConnect = network.wifi.activeAccessPoint?.ssid !== connection;
                } else {
                    label = `󰤮  ${connection}`
                    canConnect = false
                }

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
                            label={label}/>
                    </button>
                    <revealer
                        revealChild={buttonsRevealed()}
                        transitionDuration={200}
                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                        <box
                            marginTop={4}
                            vertical={true}
                            spacing={4}>
                            {canConnect && <button
                                hexpand={true}
                                cssClasses={["primaryButton"]}
                                label="Connect"
                                onClicked={() => {
                                    execAsync(`nmcli c up ${connection}`)
                                        .catch((error) => {
                                            print(error)
                                        })
                                        .finally(() => {
                                            updateConnections()
                                        })
                                }}/>}
                            <button
                                hexpand={true}
                                cssClasses={["primaryButton"]}
                                label="Forget"
                                onClicked={() => {
                                    deleteConnection(connection)
                                }}/>
                        </box>
                    </revealer>
                </box>
            })
        })}
    </box>
}

function WifiScannedConnections() {
    const network = AstalNetwork.get_default()

    return <box
        vertical={true}>
        {bind(network.wifi, "scanning").as((scanning) => {
            if (scanning) {
                return <label
                    halign={Gtk.Align.START}
                    cssClasses={["labelLargeBold"]}
                    marginBottom={4}
                    label="Scanning…"/>
            } else {
                const accessPoints = network.wifi.accessPoints

                const accessPointsUi = accessPoints.filter((value) => {
                    return value.ssid != null
                        && wifiConnections.get().find((connection) => {
                            return value.ssid === connection
                        }) == null
                }).sort((a, b) => {
                    if (a.strength > b.strength) {
                        return -1
                    } else {
                        return 1
                    }
                }).map((accessPoint) => {
                    const passwordEntryRevealed = Variable(false)

                    setTimeout(() => {
                        bind(App.get_window(NetworkWindowName)!, "visible").subscribe((visible) => {
                            if (!visible) {
                                passwordEntryRevealed.set(false)
                            }
                        })
                    }, 1_000)

                    return <box
                        vertical={true}>
                        <box
                            vertical={false}>
                            <button
                                hexpand={true}
                                cssClasses={["transparentButton"]}
                                onClicked={() => {
                                    passwordEntryRevealed.set(!passwordEntryRevealed.get())
                                }}>
                                <label
                                    halign={Gtk.Align.START}
                                    cssClasses={["labelSmall"]}
                                    label={`${getAccessPointIcon(accessPoint)}  ${accessPoint.ssid}`}/>
                            </button>
                        </box>
                        <revealer
                            revealChild={passwordEntryRevealed()}
                            transitionDuration={200}
                            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                            <PasswordEntry
                                accessPoint={accessPoint}
                                passwordEntryRevealed={passwordEntryRevealed}/>
                        </revealer>
                    </box>
                })

                return <box
                    vertical={true}>
                    <box
                    vertical={false}>
                        <label
                            halign={Gtk.Align.START}
                            cssClasses={["labelLargeBold"]}
                            label="Available networks"/>
                        <button
                            cssClasses={["iconButton"]}
                            label={"🗘"}
                            onClicked={() => {
                                network.wifi?.scan()
                            }}/>
                    </box>

                    {accessPointsUi}
                </box>
            }
        })}
    </box>
}

export default function () {
    const network = AstalNetwork.get_default()

    updateConnections()

    setTimeout(() => {
        bind(App.get_window(NetworkWindowName)!, "visible").subscribe((visible) => {
            if (visible) {
                updateConnections()
            }
        })
    }, 1_000)

    const networkName = Variable.derive([
        bind(network.client, "primaryConnection"),
    ])

    return <box
        vertical={true}
        spacing={4}>
        <label
            cssClasses={["labelMediumBold"]}
            halign={Gtk.Align.START}
            hexpand={true}
            ellipsize={Pango.EllipsizeMode.END}
            label={networkName().as((value) => {
                const primaryConnection = value[0]
                let name: string
                if (primaryConnection === null) {
                    name = "Not Connected"
                } else if (primaryConnection.id.toLowerCase().startsWith("wired")) {
                    name = "Wired"
                } else {
                    name = primaryConnection.id
                }
                return name
            })}/>
        <box
            marginTop={10}
            vertical={true}
            spacing={12}>
            {network.wifi && bind(network.wifi, "activeAccessPoint").as((activeAccessPoint) => {
                return <button
                    visible={activeAccessPoint !== null}
                    marginBottom={8}
                    cssClasses={["primaryButton"]}
                    label="Disconnect"
                    onClicked={() => {
                        disconnect(activeAccessPoint.ssid)
                    }}/>
            })}
            {network.wifi && <WifiConnections connections={inactiveWifiConnections}/>}
            {network.wifi && <WifiScannedConnections/>}
        </box>
    </box>
}
