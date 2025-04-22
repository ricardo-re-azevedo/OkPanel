// ────────────────────────────────────────────────────────────────────────────
// 1. Primitive schema definitions
// ────────────────────────────────────────────────────────────────────────────
export type PrimitiveType = 'string' | 'number' | 'boolean'
export type FieldType = PrimitiveType | 'enum' | 'object' | 'array'

export interface Field<T = any> {
    /** Dot‑notation path/name (object keys re‑use Field.name in children). */
    name: string
    /** Core kind of data stored. */
    type: FieldType
    /** Human‑readable explanation – used to auto‑generate docs. */
    description?: string
    /** If true, config must provide a value (defaults are still applied). */
    required?: boolean
    /** Default applied when the value is missing. */
    default?: T
    /** Allowed values when type === 'enum'. */
    enumValues?: readonly any[]
    /** Children when type === 'object'. */
    children?: Field[]
    /** Item schema when type === 'array'. */
    item?: Field
    /** Function to force constraints on the value.  Return true if the value is within the constraints */
    withinConstraints?: () => boolean
    /** Optional value transformation */
    transformation?: (value: T) => T
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Enumerations (re‑used by the schema)
// ────────────────────────────────────────────────────────────────────────────

export enum BarWidget {
    MENU = "menu",
    WORKSPACES = "workspaces",
    CLOCK =  "clock",
    AUDIO_OUT = "audio_out",
    AUDIO_IN = "audio_in",
    BLUETOOTH = "bluetooth",
    NETWORK = "network",
    RECORDING_INDICATOR =  "recording_indicator",
    VPN_INDICATOR = "vpn_indicator",
    BATTERY = "battery",
    TRAY = "tray",
    INTEGRATED_TRAY = "integrated_tray",
    APP_LAUNCHER = "app_launcher",
    SCREENSHOT ="screenshot",
}
export const BAR_WIDGET_VALUES = Object.values(BarWidget) as readonly BarWidget[]

export enum NotificationsPosition {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
}
export const NOTIFICATION_POSITIONS = Object.values(NotificationsPosition) as readonly NotificationsPosition[]

// Helper factory to reduce repetition for BarWidget string arrays
const widgetsArrayField = <N extends string>( //preserve the literal key
    name:        N,
    description: string,
    defaults:    readonly BarWidget[],
) =>
    ({
        name,
        type: "array",
        description,
        default: defaults,
        item: {
            name: "widget",
            type: "enum",
            enumValues: BAR_WIDGET_VALUES,
        },
    } as const satisfies Field & { name: N })

// ────────────────────────────────────────────────────────────────────────────
// 3. CONFIG_SCHEMA – the single source of truth
// ────────────────────────────────────────────────────────────────────────────
export const CONFIG_SCHEMA = [
    {
        name: 'buttonBorderRadius',
        type: 'number',
        default: 8,
        description: 'Border radius (px) used by regular buttons.',
    },
    {
        name: 'largeButtonBorderRadius',
        type: 'number',
        default: 16,
        description: 'Border radius (px) used by large buttons.',
    },
    {
        name: 'themeUpdateScript',
        type: 'string',
        description: 'Absolute path to the script run when a theme changes.',
        required: false,
    },
    {
        name: 'wallpaperUpdateScript',
        type: 'string',
        description: 'Absolute path to the script run when the wallpaper changes.',
        required: false,
    },
    {
        name: 'mainMonitor',
        type: 'number',
        default: 0,
        description: 'Index of the primary monitor (0‑based as reported by Hyprland).',
    },
    {
        name: 'scrimColor',
        type: 'string',
        default: '#00000001',
        description: 'CSS/GTK‑style color used for translucent overlays (RGBA hex). If set to #00000000 scrim will be disabled.',
        transformation: (value) => {
            if (value === "#00000000" || value === "#000000") {
                return "#00000001"
            } else {
                return value
            }
        }
    },
    {
        name: 'font',
        type: 'string',
        default: 'JetBrainsMono NF',
        description: 'Default font family used across the panel widgets.',
    },
    // ────────────────── windows ──────────────────
    {
        name: 'windows',
        type: 'object',
        description: 'Global window styling defaults.',
        children: [
            {
                name: 'gaps',
                type: 'number',
                default: 5,
                description: 'Gap (px) between tiled windows.',
            },
            {
                name: 'borderRadius',
                type: 'number',
                default: 8,
                description: 'Corner radius (px) for client‑side decorations.',
            },
            {
                name: 'borderWidth',
                type: 'number',
                default: 2,
                description: 'Window border width (px).',
            },
        ],
    },
    // ────────────────── notifications ──────────────────
    {
        name: 'notifications',
        type: 'object',
        description: 'Notification pop‑up behaviour.',
        children: [
            {
                name: 'position',
                type: 'enum',
                enumValues: NOTIFICATION_POSITIONS,
                default: NotificationsPosition.RIGHT,
                description: 'Screen edge where notification bubbles appear.',
            },
            {
                name: 'respectExclusive',
                type: 'boolean',
                default: true,
                description: 'Whether to avoid overlaying exclusive zones declared by widgets.',
            },
        ],
    },
    // ────────────────── horizontalBar ──────────────────
    {
        name: 'horizontalBar',
        type: 'object',
        description: 'Configuration for a horizontal (top/bottom) bar layout.',
        children: [
            widgetsArrayField('leftWidgets', 'Widgets anchored left.', [BarWidget.MENU, BarWidget.WORKSPACES]),
            widgetsArrayField('centerWidgets', 'Widgets centered.', [BarWidget.CLOCK]),
            widgetsArrayField(
                'rightWidgets',
                'Widgets anchored right.',
                [
                    BarWidget.RECORDING_INDICATOR,
                    BarWidget.TRAY,
                    BarWidget.AUDIO_OUT,
                    BarWidget.AUDIO_IN,
                    BarWidget.BLUETOOTH,
                    BarWidget.VPN_INDICATOR,
                    BarWidget.NETWORK,
                    BarWidget.BATTERY,
                ],
            ),
            {
                name: 'expanded',
                type: 'boolean',
                default: true,
                description: 'If true, the bar stretches to the full monitor width.',
            },
            {
                name: 'splitSections',
                type: 'boolean',
                default: false,
                description: 'If true, left/center/right widgets are rendered separately with padding.',
            },
            {
                name: 'sectionPadding',
                type: 'number',
                default: 0,
                description: 'Padding (px) around each section when splitSections = true.',
            },
            {
                name: 'minimumWidth',
                type: 'number',
                default: 800,
                description: 'Minimum bar width if not expanded.',
            },
            {
                name: 'widgetSpacing',
                type: 'number',
                default: 0,
                description: 'Spacing (px) between widgets inside the bar.',
            },
        ],
    },
    // ────────────────── verticalBar ──────────────────
    {
        name: 'verticalBar',
        type: 'object',
        description: 'Configuration for a vertical (left/right) bar layout.',
        children: [
            widgetsArrayField('topWidgets', 'Widgets anchored at the top.', [BarWidget.MENU, BarWidget.WORKSPACES]),
            widgetsArrayField('centerWidgets', 'Widgets centered vertically.', []),
            widgetsArrayField(
                'bottomWidgets',
                'Widgets anchored at the bottom.',
                [
                    BarWidget.RECORDING_INDICATOR,
                    BarWidget.TRAY,
                    BarWidget.AUDIO_OUT,
                    BarWidget.AUDIO_IN,
                    BarWidget.BLUETOOTH,
                    BarWidget.VPN_INDICATOR,
                    BarWidget.NETWORK,
                    BarWidget.BATTERY,
                    BarWidget.CLOCK,
                ],
            ),
            {
                name: 'expanded',
                type: 'boolean',
                default: true,
                description: 'If true, bar stretches the full monitor height.',
            },
            {
                name: 'splitSections',
                type: 'boolean',
                default: false,
                description: 'If true, widgets are grouped with spacing between sections.',
            },
            {
                name: 'sectionPadding',
                type: 'number',
                default: 0,
                description: 'Padding (px) around each section when splitSections = true.',
            },
            {
                name: 'minimumHeight',
                type: 'number',
                default: 600,
                description: 'Minimum bar height if not expanded.',
            },
            {
                name: 'widgetSpacing',
                type: 'number',
                default: 0,
                description: 'Spacing (px) between widgets inside the bar.',
            },
        ],
    },
    // ────────────────── systemMenu ──────────────────
    {
        name: 'systemMenu',
        type: 'object',
        description: 'Extra controls exposed by the menu button.',
        children: [
            {
                name: 'menuButtonIcon',
                type: 'string',
                default: '',
                description: 'Icon shown on the menu button (ex: Nerd Font glyph).',
            },
            {
                name: 'enableMprisWidget',
                type: 'boolean',
                default: true,
                description: 'Show the MPRIS now‑playing widget in the menu.',
            },
            {
                name: 'enableVpnControls',
                type: 'boolean',
                default: true,
                description: 'Show quick‑toggle VPN controls inside the menu.',
            },
        ],
    },
    // ────────────────── systemCommands ──────────────────
    {
        name: 'systemCommands',
        type: 'object',
        description: 'Shell commands executed by power options.',
        required: true,
        children: [
            {
                name: 'logout',
                type: 'string',
                required: true,
                description: 'Command to log the current user out.',
            },
            {
                name: 'lock',
                type: 'string',
                required: true,
                description: 'Command to lock the screen.',
            },
            {
                name: 'restart',
                type: 'string',
                required: true,
                description: 'Command to reboot the machine.',
            },
            {
                name: 'shutdown',
                type: 'string',
                required: true,
                description: 'Command to shut down the machine safely.',
            },
        ],
    },
    // ────────────────── themes ──────────────────
    {
        name: 'themes',
        type: 'array',
        description: 'List of available panel themes.',
        default: [],
        item: {
            name: 'theme',
            type: 'object',
            required: true,
            children: [
                {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'Theme name.',
                },
                {
                    name: 'icon',
                    type: 'string',
                    required: true,
                    description: 'Icon (glyph) representing the theme in lists.',
                },
                {
                    name: 'pixelOffset',
                    type: 'number',
                    default: 0,
                    description: 'Icon offset (‑10 … 10).',
                },
                {
                    name: 'wallpaperDir',
                    type: 'string',
                    default: '',
                    description: 'Directory containing theme wallpapers (may be empty).',
                },
                {
                    name: 'colors',
                    type: 'object',
                    required: true,
                    description: 'Palette used by widgets & windows.',
                    children: [
                        { name: 'background', type: 'string', required: true },
                        { name: 'foreground', type: 'string', required: true },
                        { name: 'primary', type: 'string', required: true },
                        { name: 'buttonPrimary', type: 'string', required: true },
                        { name: 'sliderTrough', type: 'string', required: true },
                        { name: 'hover', type: 'string', required: true },
                        { name: 'warning', type: 'string', required: true },
                        { name: 'barBorder', type: 'string', required: true },
                        { name: 'windowBorder', type: 'string', required: true },
                        { name: 'alertBorder', type: 'string', required: true },
                    ],
                },
            ],
        },
    },
] as const satisfies Field[]

// ───────────────────────────────────────────────
//  Type‑generation helpers – compile‑time only
// ───────────────────────────────────────────────
type PrimitiveByKind<K extends PrimitiveType> =
    K extends 'string'  ? string  :
        K extends 'number'  ? number  :
            K extends 'boolean' ? boolean : never

type FieldToProp<F extends Field> =
    F['type'] extends 'object'
        ? SchemaToType<F['children']>
        : F['type'] extends 'array'
            ? FieldToProp<NonNullable<F['item']>>[]
            : F['type'] extends 'enum'
                ? (F['enumValues'] extends readonly (infer E)[] ? E : string)
                : PrimitiveByKind<F['type' & PrimitiveType]>

type SchemaToType<S extends readonly Field[] | undefined> =
    S extends readonly Field[]
        ? { [K in S[number] as K['name']]: FieldToProp<K> }
        : unknown

// ───────────────────────────────────────────────
//  Derived section‑level types for convenience
// ───────────────────────────────────────────────
export type Config = SchemaToType<typeof CONFIG_SCHEMA>

export type Windows        = Config["windows"]
export type Notifications  = Config["notifications"]
export type HorizontalBar  = Config["horizontalBar"]
export type VerticalBar    = Config["verticalBar"]
export type SystemMenu     = Config["systemMenu"]
export type SystemCommands = Config["systemCommands"]

// Whole themes array vs. a single theme
export type Themes = Config["themes"]
export type Theme  = Themes[number]

export const themeSchema = (CONFIG_SCHEMA.find(f => f.name === "themes")!.item!)!
