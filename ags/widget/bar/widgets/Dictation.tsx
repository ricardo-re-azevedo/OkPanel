import {exec, execAsync} from "astal/process";
import {Variable} from "astal";
import {Gtk} from "astal/gtk4";
import {toggleWindow} from "../../utils/windows";
import ScrimScrollWindow from "../../common/ScrimScrollWindow";
import RevealerRow from "../../common/RevealerRow";
import {config, selectedBar} from "../../../config/config";
import {Bar} from "../../../config/bar";
import {BarWidget} from "../../../config/configSchema";
import {insertNewlines} from "../../utils/strings";

export const DictationWindowName = "dictationMenuWindow"

// voxtype status prints one of: stopped, idle, recording, streaming, transcribing
const state = Variable<string>("stopped")
const model = Variable<string>("")
const live = Variable<boolean>(false)

const MODELS = [
    {name: "medium.en", description: "Accurate, slower (~1.5 GB)"},
    {name: "small.en", description: "Faster, less accurate (~0.5 GB)"},
]

export function dictation_installed(): boolean {
    try {
        exec("bash -c 'command -v voxtype'")
        return true
    } catch {
        return false
    }
}

function refresh() {
    execAsync("voxtype status")
        .then((out) => state.set(out.trim()))
        .catch((err) => print(err))
}

function service_set(on: boolean) {
    execAsync(`systemctl --user ${on ? "start" : "stop"} voxtype`)
        .then(() => refresh())
        .catch((err) => print(err))
}

// The daemon reads its config at startup, so apply changes with a restart if it's running
function config_set(settings: string[][]) {
    const sets = settings.map(([key, value]) => `voxtype config set ${key} ${value}`).join(" && ")
    return execAsync(`bash -c '${sets} && systemctl --user try-restart voxtype'`)
        .then(() => refresh())
}

function model_set(name: string) {
    config_set([["whisper.model", name]])
        .then(() => model.set(name))
        .catch((err) => print(err))
}

// voxtype only streams when the model stays loaded, so live typing turns on-demand loading off
function live_set(on: boolean) {
    config_set([["whisper.streaming", `${on}`], ["whisper.on_demand_loading", `${!on}`]])
        .then(() => live.set(on))
        .catch((err) => print(err))
}

function load_config() {
    execAsync("voxtype config get whisper.model")
        .then((out) => model.set(out.trim()))
        .catch((err) => print(err))
    execAsync("voxtype config get whisper.streaming")
        .then((out) => live.set(out.trim() == "true"))
        .catch((err) => print(err))
}

export function Dictation() {
    state.poll(1500, ["voxtype", "status"], (out) => out.trim())
    load_config()

    const tooltip = Variable.derive([state, model], (s, m) => {
        if (s == "stopped") {
            return "Dictation service off"
        } else if (s == "idle") {
            return `Dictation ready (SUPER+M, ${m})`
        } else {
            return `Dictation ${s}… (${m})`
        }
    })

    return <button
        cssClasses={state((v) => {
            if (v == "stopped" || v == "idle") {
                return ["iconButton"]
            } else {
                return ["recordingIconButton"]
            }
        })}
        label={state((v) => v == "stopped" ? "󰻔" : "󰗋")}
        tooltipText={tooltip()}
        onClicked={() => toggleWindow(DictationWindowName)}
        onDestroy={() => tooltip.drop()}
    >
    </button>
}

function SwitchRow(
    {label, note, active, onToggled}: {
        label: string,
        note?: string,
        active: Variable<boolean>,
        onToggled: (on: boolean) => void,
    }
) {
    return <box
        vertical={true}>
        <box
            vertical={false}>
            <label
                cssClasses={["labelMediumBold"]}
                halign={Gtk.Align.START}
                hexpand={true}
                label={label}/>
            <switch
                valign={Gtk.Align.CENTER}
                active={active()}
                onNotifyActive={(self) => {
                    // ignore the notify fired when the binding itself updates the switch
                    if (self.active != active.get()) {
                        onToggled(self.active)
                    }
                }}/>
        </box>
        {note !== undefined && <label
            cssClasses={["labelSmall"]}
            halign={Gtk.Align.START}
            xalign={0}
            label={insertNewlines(note, 38)}/>}
    </box>
}

function DictationOptions() {
    const serviceOn = Variable<boolean>(false)
    state.subscribe((s) => serviceOn.set(s != "stopped"))

    return <box
        vertical={true}
        spacing={10}>
        <SwitchRow
            label="Dictation service"
            note="SUPER+M starts and stops dictation while the service is on."
            active={serviceOn}
            onToggled={(on) => service_set(on)}/>
        <SwitchRow
            label="Live typing"
            note="Types text while you speak. Keeps the model loaded on the GPU while the service is on, so battery use is higher."
            active={live}
            onToggled={(on) => live_set(on)}/>
        <RevealerRow
            icon="󰗋"
            iconOffset={0}
            windowName={DictationWindowName}
            content={
                <label
                    cssClasses={["labelMediumBold"]}
                    halign={Gtk.Align.START}
                    hexpand={true}
                    label={model((m) => `Model: ${m}`)}/>
            }
            revealedContent={
                <box
                    vertical={true}>
                    {MODELS.map((m) => {
                        return <button
                            hexpand={true}
                            cssClasses={model((current) => {
                                return current == m.name ? ["primaryButton"] : ["transparentButton"]
                            })}
                            onClicked={() => model_set(m.name)}>
                            <label
                                halign={Gtk.Align.START}
                                cssClasses={["labelSmall"]}
                                xalign={0}
                                label={`${m.name}\n${m.description}`}/>
                        </button>
                    })}
                </box>
            }/>
    </box>
}

export function DictationMenu() {
    return <ScrimScrollWindow
        monitor={config.mainMonitor}
        windowName={DictationWindowName}
        topExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.BOTTOM:
                    return true
                default:
                    return false
            }
        })}
        bottomExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                    return true
                default:
                    return false
            }
        })}
        leftExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.rightWidgets.includes(BarWidget.CLOCK)
                default:
                    return false
            }
        })}
        rightExpand={selectedBar((bar) => {
            switch (bar) {
                case Bar.TOP:
                case Bar.BOTTOM:
                    return config.horizontalBar.centerWidgets.includes(BarWidget.CLOCK)
                        || config.horizontalBar.leftWidgets.includes(BarWidget.CLOCK)
                default:
                    return false
            }
        })}
        contentWidth={340}
        width={config.horizontalBar.minimumWidth}
        height={config.verticalBar.minimumHeight}
        content={
            <box
                cssClasses={["calendarBox"]}
                vertical={true}>
                <DictationOptions/>
            </box>
        }/>
}
