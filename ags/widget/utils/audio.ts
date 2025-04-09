import Wp from "gi://AstalWp"
import {execAsync} from "astal/process";
import {projectDir} from "./config/config";

export function getVolumeIcon(speaker?: Wp.Endpoint) {
    let volume = speaker?.volume
    let muted = speaker?.mute
    let speakerIcon = speaker?.icon
    if (volume == null || speakerIcon == null) return ""

    if (speakerIcon.includes("bluetooth")) {
        if (volume === 0 || muted) {
            return "󰟎"
        } else {
            return "󰥰"
        }
    } else if (speakerIcon.includes("headset")) {
        if (volume === 0 || muted) {
            return "󰟎"
        } else {
            return "󰋋"
        }
    } else {
        if (volume === 0 || muted) {
            return "󰝟"
        } else if (volume < 0.33) {
            return ""
        } else if (volume < 0.66) {
            return ""
        } else {
            return "󰕾"
        }
    }
}

export function getMicrophoneIcon(mic?: Wp.Endpoint): string {
    let volume = mic?.volume
    let muted = mic?.mute
    let micIcon = mic?.icon

    if (micIcon != null && micIcon.includes("bluetooth")) {
        if (volume === 0 || muted) {
            return "󰟎"
        } else {
            return "󰥰"
        }
    } else if (micIcon != null && micIcon.includes("headset")) {
        if (volume === 0 || muted) {
            return "󰋐"
        } else {
            return "󰋎"
        }
    } else {
        if (volume === 0 || muted) {
            return "󰍭"
        } else {
            return ""
        }
    }
}

export function toggleMuteEndpoint(endpoint?: Wp.Endpoint) {
    endpoint?.set_mute(!endpoint?.mute)
}

export function muteVolume() {
    const defaultSpeaker = Wp.get_default()!.audio.default_speaker
    defaultSpeaker?.set_mute(!defaultSpeaker?.mute)
    playVolumeTick()
}

export function increaseVolume() {
    const defaultSpeaker = Wp.get_default()!.audio.default_speaker
    const currentVolume = defaultSpeaker.volume
    if (currentVolume < 0.95) {
        defaultSpeaker.volume = currentVolume + 0.05
    } else {
        defaultSpeaker.volume = 1
    }
    playVolumeTick()
}

export function decreaseVolume() {
    const defaultSpeaker = Wp.get_default()!.audio.default_speaker
    const currentVolume = defaultSpeaker.volume
    if (currentVolume > 0.05) {
        defaultSpeaker.volume = currentVolume - 0.05
    } else {
        defaultSpeaker.volume = 0
    }
    playVolumeTick()
}

export function playVolumeTick() {
    execAsync(`bash -c "play ${projectDir}/sounds/audio-volume-change.oga"`)
        .catch((error) => {
            print(error)
        })
}

export function playCameraShutter() {
    execAsync(`bash -c "play ${projectDir}/sounds/camera-shutter.ogg"`)
        .catch((error) => {
            print(error)
        })
}

export function playBatteryWarning() {
    execAsync(`bash -c "play ${projectDir}/sounds/battery-low.ogg"`)
        .catch((error) => {
            print(error)
        })
}

export function playPowerPlug() {
    execAsync(`bash -c "play ${projectDir}/sounds/power-plug.ogg"`)
        .catch((error) => {
            print(error)
        })
}

export function playPowerUnplug() {
    execAsync(`bash -c "play ${projectDir}/sounds/power-unplug.ogg"`)
        .catch((error) => {
            print(error)
        })
}
