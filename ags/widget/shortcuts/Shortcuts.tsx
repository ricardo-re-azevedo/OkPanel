import {App, Astal, Gdk, Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import Divider from "../common/Divider";
import {hideAllWindows} from "../utils/windows";
import {config} from "../../config/config";
import {Keybind, getKeybindings} from "../screenshot/helpers";
import {chunkIntoColumns} from "../utils/chunking";
import Wp from "gi://AstalWp";
import {Binding} from "astal";

export const ShortcutsWindowName = "shortcutsWindow"

//TODO: https://ricoberger.de/cheat-sheets/yazi/

const adtlShortcuts: { [key: string]: { [key: string]: string } } = {
    'zoxide': {
        'z foo': 'cd to highest ranked directory matching foo',
        'z foo bar': 'cd to highest ranked directory matching foo and bar',
        'z ..': 'cd into parent directory',
        'z -': 'cd into previous directory',
        'zi foo': 'cd with interactive selection (requires fzf)'
    }
}


const keycodeMap: { [key: number]: string } = {
    272: "Mouse Left",
    273: "Mouse Right",
    72: "SUPER + ALT",
    65: "SUPER + SHIFT",
    64: "SUPER",
    0: ""
}

function KeybindColumn({keybinds}: { keybinds: Keybind[] }) {
    return (
        <box
            vertical={false}
            halign={Gtk.Align.CENTER}
            marginTop={10}
            marginEnd={50}>
            <box
                vertical={true}>
                {keybinds.map((keybind) => {
                    let mod = keycodeMap[keybind.modmask];
                    let keyCombo = `${keycodeMap[keybind.modmask]} + ${keybind.key}`;
                    if (mod === "") {
                        keyCombo = `${keybind.key}`
                    }

                    return <box>
                        <label
                            cssClasses={["keyboardKey"]}
                            label={mod}/>
                        +
                        <label
                            cssClasses={["keyboardKey"]}
                            label={keybind.key}/>
                    </box>
                })}

            </box>
            <box
                vertical={true}
                halign={Gtk.Align.START}>
                {keybinds.map((keybind) => {
                    return <box>
                        <label
                            marginTop={13}
                            marginBottom={14}
                            marginStart={20}
                            cssClasses={["labelMedium"]}
                            label={keybind.description}/>
                    </box>
                })}
            </box>
        </box>
    );
};

function TermShortcut(
    {cmd, desc}: { cmd: string, desc: string }) {

    return <box
        marginBottom={8}>
        <label
            cssClasses={["termCommand"]}
            label={cmd}/>
        <label
            marginStart={20}
            cssClasses={["labelMedium"]}
            label={desc}/>
    </box>
};

function TermShortcutsGroup(
    {header, shortcuts}: { header: string, shortcuts: { [key: string]: string } }) {

    return <box
        vertical={true}>
        <label
            cssClasses={["labelLarge"]}
            label={header}/>
        {Object.keys(shortcuts).map((cmd) => {
            return <TermShortcut cmd={cmd} desc={shortcuts[cmd]}/>
        })}
    </box>
}

function TermShortcutsColumn() {

    return <box
        vertical={true}
        halign={Gtk.Align.CENTER}
        marginTop={10}>
        {Object.keys(adtlShortcuts).map((head) => {
            return <TermShortcutsGroup
                header={head}
                shortcuts={adtlShortcuts[head]}/>
        })}
    </box>
}

export default function () {
    const allBinds = getKeybindings();
    // Filter out media keys
    const binds = allBinds.filter(b => !b.key.includes("XF86"));
    const numberOfColumns = 2

    const columatedBinds = chunkIntoColumns(binds, numberOfColumns);

    return <window
        cssClasses={["transparentBackground"]}
        name={ShortcutsWindowName}
        application={App}
        layer={Astal.Layer.OVERLAY}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM |
            Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        keymode={Astal.Keymode.EXCLUSIVE}
        margin={5}
        visible={false}
        onKeyPressed={function (_, key) {
            if (key === Gdk.KEY_Escape) {
                hideAllWindows()
            }
        }}>
        <Gtk.ScrolledWindow
            cssClasses={["scrollWindow", "window"]}
            vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
            propagateNaturalHeight={true}>
            <box
                vertical={false}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}>
                <box
                    vertical={true}>
                    <label
                        cssClasses={["labelLarge"]}
                        label={"Global"}/>
                    <box
                        vertical={false}
                        halign={Gtk.Align.CENTER}
                        valign={Gtk.Align.CENTER}
                        spacing={100}>
                        {columatedBinds.map((chunk) => {
                            return <KeybindColumn keybinds={chunk}/>

                        })}
                    </box>
                </box>
                <TermShortcutsColumn/>
            </box>
        </Gtk.ScrolledWindow>

    </window>
}