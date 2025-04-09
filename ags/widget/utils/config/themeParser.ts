import {Theme} from "./config";

/**
 * Parse and apply theme from external request
 */
export function parseTheme(input: string): Theme {
    const flagMap: Record<string, keyof Theme['colors']> = {
        b: 'background',
        background: 'background',
        f: 'foreground',
        foreground: 'foreground',
        p: 'primary',
        primary: 'primary',
        bt: 'buttonPrimary',
        button: 'buttonPrimary',
        h: 'hover',
        hover: 'hover',
        s: 'sliderTrough',
        slider: 'sliderTrough',
        w: 'warning',
        warning: 'warning',
    };

    const regex = /--?([a-z]+)\s+(#[0-9a-fA-F]{6})/g;
    const colors: Partial<Theme['colors']> = {};

    let match;
    while ((match = regex.exec(input)) !== null) {
        const [_, key, value] = match;
        const mappedKey = flagMap[key];
        if (mappedKey) {
            colors[mappedKey] = value;
        }
    }

    // Fill in default values or throw if any required color is missing
    const defaultColor = "#000000";
    const completeColors: Theme['colors'] = {
        background: colors.background ?? defaultColor,
        foreground: colors.foreground ?? defaultColor,
        primary: colors.primary ?? defaultColor,
        buttonPrimary: colors.buttonPrimary ?? defaultColor,
        sliderTrough: colors.sliderTrough ?? defaultColor,
        hover: colors.hover ?? defaultColor,
        warning: colors.warning ?? defaultColor,
    };

    return {
        name: "okpanel-shell",
        icon: "",
        pixelOffset: 0,
        wallpaperDir: "",
        colors: completeColors,
    };
}