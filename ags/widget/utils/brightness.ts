import {Variable} from "astal"
import Brightness from "./connectables/brightness";

// incremented by the brightness keys so the alert only shows for user changes, not wluma
export const brightnessKeyPressed = Variable(0)

export function getBrightnessIcon(brightness: Brightness) {
    const value = brightness.screen

    if (value < 0.33) {
        return "󰃞"
    } else if (value < 0.66) {
        return "󰃝"
    } else {
        return "󰃠"
    }
}

// key steps are taken on a curve so there is finer control at low brightness
const exponent = 2

export function increaseBrightness() {
    const brightness = Brightness.get_default()
    const currentBrightness = Math.pow(brightness.screen, 1 / exponent)
    if (currentBrightness < 0.95) {
        brightness.screen = Math.pow(currentBrightness + 0.05, exponent)
    } else {
        brightness.screen = 1
    }
    brightnessKeyPressed.set(brightnessKeyPressed.get() + 1)
}

export function decreaseBrightness() {
    const brightness = Brightness.get_default()
    const currentBrightness = Math.pow(brightness.screen, 1 / exponent)
    if (currentBrightness > 0.06) {
        brightness.screen = Math.pow(currentBrightness - 0.05, exponent)
    } else {
        brightness.screen = 0.0001
    }
    brightnessKeyPressed.set(brightnessKeyPressed.get() + 1)
}
