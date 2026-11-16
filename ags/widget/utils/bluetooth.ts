import Bluetooth from "gi://AstalBluetooth"
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import {execAsync} from "astal/process"

export function getBluetoothIcon() {
    const bluetooth = Bluetooth.get_default()

    if (bluetooth.adapter == null) {
        return "󰂲"
    } else {
        return "󰂯"
    }
}

export function getBluetoothName() {
    const bluetooth = Bluetooth.get_default()
    if (bluetooth.adapter == null) {
        return "No bluetooth adapter"
    } else {
        return "Bluetooth"
    }
}

const AGENT_PATH = "/com/okpanel/BluetoothAgent"

const AGENT_XML = `
<node>
  <interface name="org.bluez.Agent1">
    <method name="Release"/>
    <method name="RequestPinCode"><arg type="o" direction="in"/><arg type="s" direction="out"/></method>
    <method name="DisplayPinCode"><arg type="o" direction="in"/><arg type="s" direction="in"/></method>
    <method name="RequestPasskey"><arg type="o" direction="in"/><arg type="u" direction="out"/></method>
    <method name="DisplayPasskey"><arg type="o" direction="in"/><arg type="u" direction="in"/><arg type="q" direction="in"/></method>
    <method name="RequestConfirmation"><arg type="o" direction="in"/><arg type="u" direction="in"/></method>
    <method name="RequestAuthorization"><arg type="o" direction="in"/></method>
    <method name="AuthorizeService"><arg type="o" direction="in"/><arg type="s" direction="in"/></method>
    <method name="Cancel"/>
  </interface>
</node>`

// Pairing agent that is only registered while the user is pairing from the panel.
// It accepts confirmation/authorization requests (the user just clicked Pair) and
// rejects anything that needs a typed PIN or passkey, since the panel can't prompt for one.
function reject(invocation: Gio.DBusMethodInvocation) {
    invocation.return_dbus_error("org.bluez.Error.Rejected", "OkPanel can't enter PIN codes or passkeys")
}

const agent = Gio.DBusExportedObject.wrapJSObject(AGENT_XML, {
    Release() {},
    RequestPinCodeAsync(_params: unknown, invocation: Gio.DBusMethodInvocation) { reject(invocation) },
    DisplayPinCode() {},
    RequestPasskeyAsync(_params: unknown, invocation: Gio.DBusMethodInvocation) { reject(invocation) },
    DisplayPasskey() {},
    RequestConfirmation() {},
    RequestAuthorization() {},
    AuthorizeService() {},
    Cancel() {},
})

function callAgentManager(method: string, params: GLib.Variant) {
    Gio.DBus.system.call_sync(
        "org.bluez", "/org/bluez", "org.bluez.AgentManager1", method,
        params, null, Gio.DBusCallFlags.NONE, -1, null)
}

function registerAgent() {
    agent.export(Gio.DBus.system, AGENT_PATH)
    try {
        callAgentManager("RegisterAgent", new GLib.Variant("(os)", [AGENT_PATH, "NoInputNoOutput"]))
    } catch (error) {
        // AlreadyExists if a previous pairing didn't clean up; the agent is still ours.
        if (!`${error}`.includes("AlreadyExists")) {
            agent.unexport()
            throw error
        }
    }
    callAgentManager("RequestDefaultAgent", new GLib.Variant("(o)", [AGENT_PATH]))
}

function unregisterAgent() {
    try {
        callAgentManager("UnregisterAgent", new GLib.Variant("(o)", [AGENT_PATH]))
    } catch (error) {
        print(error)
    }
    agent.unexport()
}

export async function pairDevice(device: Bluetooth.Device) {
    // The adapter isn't always hci0 (it can come back as hci1 after a resume), so look up the device's real path.
    const deviceNode = `/dev_${device.address.replaceAll(":", "_")}`
    const tree = await execAsync(["busctl", "--list", "tree", "org.bluez"])
    const devicePath = tree.split("\n").map((line) => line.trim())
        .find((path) => path.endsWith(deviceNode))
    if (devicePath == null) {
        throw new Error(`No bluez object for ${device.address}`)
    }

    // bluez needs an agent to confirm the pairing; without one, devices that ask for confirmation fail with
    // "No agent available". bluetoothctl can't be used instead because it doesn't register an agent when non-interactive.
    registerAgent()
    try {
        // device.pair() is synchronous and blocks the UI, so make the same dbus call through busctl.
        await execAsync(["busctl", "call", "--timeout=60", "org.bluez", devicePath, "org.bluez.Device1", "Pair"])
    } finally {
        unregisterAgent()
    }
    device.set_trusted(true)
}
