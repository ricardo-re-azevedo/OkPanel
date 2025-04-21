import { Theme, CONFIG_SCHEMA }         from "./configSchema";
import { validateAndApplyDefaults }     from "./configLoader";  // <- already exported
import type { Field }                   from "./configSchema";

/* ------------------------------------------------------------------ */
/* helper – grab the theme item schema once so we can reuse defaults  */
/* ------------------------------------------------------------------ */
const themeField = CONFIG_SCHEMA.find(f => f.name === "themes")!;
const THEME_SCHEMA = (themeField.item as Field).children!;       // children of 'theme'

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
        bb: 'barBorder',
        barBorder: 'barBorder',
        ab: 'alertBorder',
        alertBorder: 'alertBorder',
        wb: 'windowBorder',
        windowBorder: 'windowBorder',
    };

    const regex = /--?([a-z]+)\s+(#[0-9a-fA-F]{6})/g;
    const colors: Partial<Theme['colors']> = {};

    let match;
    while ((match = regex.exec(input)) !== null) {
        const [_, key, value] = match;
        const mappedKey = flagMap[key];
        if (mappedKey) {
            // @ts-ignore
            colors[mappedKey] = value;
        }
    }

    return validateAndApplyDefaults<Theme>(
        {
            name: "okpanel-shell",
            icon: "",
            pixelOffset: 0,
            wallpaperDir: "",
            colors: colors,
        },
        THEME_SCHEMA,
    );
}