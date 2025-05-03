import Battery from "gi://AstalBattery";

const formatTime = (seconds: number): Record<string, number> => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
};

export function getBatteryIcon(battery: Battery.Device) {
    const percent = battery.percentage
    if (battery.state === Battery.State.CHARGING) {
        if (percent <= 0.1) {
            return "󰢜"
        } else if (percent <= 0.2) {
            return "󰂆"
        } else if (percent <= 0.3) {
            return "󰂇"
        } else if (percent <= 0.4) {
            return "󰂈"
        } else if (percent <= 0.5) {
            return "󰢝"
        } else if (percent <= 0.6) {
            return "󰂉"
        } else if (percent <= 0.7) {
            return "󰢞"
        } else if (percent <= 0.8) {
            return "󰂊"
        } else if (percent <= 0.9) {
            return "󰂋"
        } else {
            return "󰂅"
        }
    } else {
        if (percent <= 0.1) {
            return "󰁺"
        } else if (percent <= 0.2) {
            return "󰁻"
        } else if (percent <= 0.3) {
            return "󰁼"
        } else if (percent <= 0.4) {
            return "󰁽"
        } else if (percent <= 0.5) {
            return "󰁾"
        } else if (percent <= 0.6) {
            return "󰁿"
        } else if (percent <= 0.7) {
            return "󰂀"
        } else if (percent <= 0.8) {
            return "󰂁"
        } else if (percent <= 0.9) {
            return "󰂂"
        } else {
            return "󰁹"
        }
    }
}
export function getBatteryTooltip(battery: Battery.Device) {

    if (battery.state === Battery.State.FULLY_CHARGED) {
        return 'Full';
    } else if (battery.state === Battery.State.CHARGING) {
        const { hours, minutes } = formatTime(battery.timeToFull);
        return `Time to full: ${hours} h ${minutes} min`;
    } else {
        const { hours, minutes } = formatTime(battery.timeToEmpty);
        return `Time to empty: ${hours} h ${minutes} min`;
    }
}