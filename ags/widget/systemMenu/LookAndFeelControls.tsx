import {App, Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import {bind, Variable} from "astal"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import Pango from "gi://Pango?version=1.0";
import {createScaledTexture} from "../utils/images";
import {
    Bar,
    ClockPosition,
    clockPosition,
    MenuPosition,
    menuPosition,
    selectedBar,
    setBarType,
    setClockPosition,
    setMenuPosition
} from "../bar/Bar";
import Divider from "../common/Divider";
import {config, selectedTheme, setTheme, setWallpaper, Theme} from "../utils/config/config";

const files: Variable<string[][]> = Variable([])
const numberOfColumns = 2
let buttonsEnabled = true

function updateTheme(theme: Theme) {
    if (!buttonsEnabled) {
        return
    }
    buttonsEnabled = false
    setTheme(theme, () => {
        buttonsEnabled = true
    })
}

function chunkIntoColumns<T>(arr: T[], numCols: number): T[][] {
    // Create numCols empty arrays
    const columns: T[][] = Array.from({ length: numCols }, () => []);

    // Distribute each item into the correct column
    arr.forEach((item, i) => {
        const colIndex = i % numCols;
        columns[colIndex].push(item);
    });

    return columns;
}

function chunkEvenly<T>(items: T[], maxPerRow: number): T[][] {
    const total = items.length;
    const rowCount = Math.ceil(total / maxPerRow);
    const baseSize = Math.floor(total / rowCount);
    const remainder = total % rowCount;

    const chunks: T[][] = [];
    let index = 0;

    for (let i = 0; i < rowCount; i++) {
        const size = baseSize + (i < remainder ? 1 : 0); // Spread out the extras
        chunks.push(items.slice(index, index + size));
        index += size;
    }

    return chunks;
}

function updateFiles(theme: Theme) {
    execAsync(["bash", "-c", `ls ${theme.wallpaperDir}`])
        .catch((error) => {
            print(error)
        })
        .then((value) => {
            if (typeof value !== "string") {
                return
            }

            files.set(
                chunkIntoColumns(
                    value
                        .split("\n")
                        .filter((line) => line.includes("jpg") || line.includes("png")),
                    numberOfColumns
                )
            )
        })
}

function updateMargins(box: Gtk.Box, theme: Theme) {
    let pixelAdjustment = theme.pixelOffset
    const leftPadding = 15 - pixelAdjustment
    const rightPadding = 15 + pixelAdjustment

    box.marginStart = leftPadding
    box.marginEnd = rightPadding
}

function BarButton(
    {
        barType,
        icon,
    }: {
        barType: Bar,
        icon: string,
    }
) {
    return <button
        cssClasses={selectedBar((bar) => {
            if (bar === barType) {
                return ["themeButtonSelected"]
            }
            return ["themeButton"]
        })}
        onClicked={() => {
            setBarType(barType)
        }}>
        <label
            marginTop={8}
            marginBottom={8}
            marginStart={16}
            marginEnd={20}
            label={icon}/>
    </button>
}

function BarPositionOptions() {
    return <box
        vertical={false}
        halign={Gtk.Align.CENTER}
        spacing={12}>
        <BarButton barType={Bar.LEFT} icon={"󱂪"}/>
        <BarButton barType={Bar.TOP} icon={"󱔓"}/>
        <BarButton barType={Bar.RIGHT} icon={"󱂫"}/>
        <BarButton barType={Bar.BOTTOM} icon={"󱂩"}/>
    </box>
}

function BarWidgetOptions2() {
    let menuSwitch: Gtk.Switch | null = null
    let clockSwitch: Gtk.Switch | null = null
    return <box
        marginStart={20}
        marginEnd={20}
        hexpand={true}
        vertical={true}>
        <box
            vertical={false}
            hexpand={true}>
            <label
                cssClasses={["labelSmall"]}
                label="󰣇  Alternate menu position"/>
            <box hexpand={true}/>
            <switch
                onNotifyActive={() => {
                    if (menuSwitch?.active) {
                        setMenuPosition(MenuPosition.ALTERNATE)
                    } else {
                        setMenuPosition(MenuPosition.DEFAULT)
                    }
                }}
                setup={(self) => {
                    menuSwitch = self
                    self.active = menuPosition.get() === MenuPosition.ALTERNATE
                }}/>
        </box>
        <box
            vertical={false}
            hexpand={true}>
            <label
                cssClasses={["labelSmall"]}
                label="  Alternate clock position"/>
            <box hexpand={true}/>
            <switch
                onNotifyActive={() => {
                    if (clockSwitch?.active) {
                        setClockPosition(ClockPosition.ALTERNATE)
                    } else {
                        setClockPosition(ClockPosition.DEFAULT)
                    }
                }}
                setup={(self) => {
                    clockSwitch = self
                    self.active = clockPosition.get() === ClockPosition.ALTERNATE
                }}/>
        </box>
    </box>
}

function ThemeButton(
    {
        theme
    }:
    {
        theme: Theme,
    }
) {
    const leftPadding = 18 - theme.pixelOffset
    const rightPadding = 18 + theme.pixelOffset
    return <button
        cssClasses={selectedTheme((selectedTheme) =>
            selectedTheme === theme ? ["themeButtonSelected"] : ["themeButton"])}
        onClicked={() => {
            updateTheme(theme)
        }}>
        <label
            marginTop={8}
            marginBottom={8}
            marginStart={leftPadding}
            marginEnd={rightPadding}
            label={theme.icon}/>
    </button>
}

function ThemeOptions() {
    const themeRows = chunkEvenly(config.themes, 5)

    return <box
        vertical={true}
        spacing={4}>
        {themeRows.map((themeRow) => {
            return <box
                vertical={false}
                cssClasses={["row"]}
                halign={Gtk.Align.CENTER}
                spacing={12}>
                {themeRow.map((theme) => {
                    return <ThemeButton theme={theme}/>
                })}
            </box>
        })}
    </box>
}

function WallpaperColumn(
    {
        column
    }: {
        column: number,
    }
) {
    return <box
        hexpand={true}
        vertical={true}>
        {files((filesList) => {
            if (filesList.length === 0) {
                return null
            }
            return filesList[column].map((file) => {
                const path = `${selectedTheme.get()?.wallpaperDir}/${file}`
                // 140x70 is a magic number that scales well and doesn't cause unwanted expansion of the scroll window
                const texture = createScaledTexture(140, 70, path)

                return <button
                    cssClasses={["wallpaperButton"]}
                    onClicked={() => {
                        setWallpaper(path)
                    }}>
                    <Gtk.Picture
                        heightRequest={90}
                        cssClasses={["wallpaper"]}
                        keepAspectRatio={true}
                        contentFit={Gtk.ContentFit.COVER}
                        paintable={texture}/>
                </button>
            })
        })}
    </box>
}

export default function () {
    selectedTheme.subscribe((theme) => {
        if (theme != null) {
            updateFiles(theme)
        }
    })
    updateFiles(selectedTheme.get())

    const wallpaperChooserRevealed = Variable(false)

    setTimeout(() => {
        bind(App.get_window(SystemMenuWindowName)!, "visible").subscribe((visible) => {
            if (!visible) {
                wallpaperChooserRevealed.set(false)
            }
        })
    }, 1_000)

    return <box
        vertical={true}>
        <box
            vertical={false}
            cssClasses={["row"]}>
            <box
                marginTop={10}
                marginBottom={10}
                setup={(self) => {
                    const currentTheme = selectedTheme.get()
                    if (currentTheme != null) {
                        updateMargins(self, currentTheme)
                    }

                    selectedTheme.subscribe((theme) => {
                        if (theme != null) {
                            updateMargins(self, theme)
                        }
                    })
                }}>
                <label
                    cssClasses={["systemMenuIconLabel"]}
                    label={selectedTheme((theme) => {
                        return theme?.icon ?? ""
                    })}/>
            </box>
            <label
                cssClasses={["labelMediumBold"]}
                halign={Gtk.Align.START}
                hexpand={true}
                ellipsize={Pango.EllipsizeMode.END}
                label="Look and Feel"/>
            <button
                cssClasses={["iconButton"]}
                label={wallpaperChooserRevealed((revealed): string => {
                    if (revealed) {
                        return ""
                    } else {
                        return ""
                    }
                })}
                onClicked={() => {
                    wallpaperChooserRevealed.set(!wallpaperChooserRevealed.get())
                }}/>
        </box>
        <revealer
            cssClasses={["rowRevealer"]}
            revealChild={wallpaperChooserRevealed()}
            transitionDuration={200}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
            <box
                vertical={true}>
                {config.themes.length > 1 && <box
                    vertical={true}>
                    <ThemeOptions/>
                    <Divider
                        marginStart={20}
                        marginEnd={20}
                        marginTop={10}
                        marginBottom={10}/>
                </box>}
                <BarPositionOptions/>
                <box marginTop={10}/>
                <BarWidgetOptions2/>
                <box marginTop={10}/>
                <box
                    vertical={false}>
                    {Array.from({length: numberOfColumns}).map((_, index) => {
                        return <WallpaperColumn column={index}/>
                    })}
                </box>
            </box>
        </revealer>
    </box>
}