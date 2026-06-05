import {exec, execAsync} from "astal/process";
import {Variable} from "astal";

//TODO: widget does not track state if it is changed outside of the widget.

const state = Variable<string>("Running")

export function tailscale_installed(): boolean {
    let exists = exec("bash -c systemctl is-active tailscale")
    if (exists != "inactive") {
        return true
    } else {
        return false
    }
}

function tailscale_status() {

    execAsync("bash -c 'tailscale status --json'")
        .then((out) => {
            let status = JSON.parse(out)["BackendState"]
            state.set(status)
        })
        .catch((err) => print(err))
}

function tailscale_toggle() {
    tailscale_status()
    if (state.get() == "Running") {
        execAsync("bash -c 'tailscale down'")
            .then((out) => tailscale_status())
            .catch((err) => print(err))
    } else {
        execAsync("bash -c 'tailscale up'")
            .then((out) => tailscale_status())
            .catch((err) => print(err))
    }
}

export function Tailscale() {

    tailscale_status()

    return <button
        cssClasses={["iconButton"]}
        iconName={state((v) => {
            print(v)
                if (v == "Running") {
                    return "tailscale-light"
                } else {
                    return "tailscale-light-inactive"
                }
            }
        )}
        tooltipText={state((v) => {
            return v
        })}
        onClicked={() => tailscale_toggle()}
    >
    </button>
}
