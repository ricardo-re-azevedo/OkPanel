import {App, Gtk} from "astal/gtk4"
import {execAsync} from "astal/process"
import {bind, Variable} from "astal"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import Pango from "gi://Pango?version=1.0";
import {createScaledTexture} from "../utils/images";
import {Bar, selectedBar, setBarType} from "../bar/Bar";
import Divider from "../common/Divider";
import {config, selectedTheme, setTheme, setWallpaper, Theme} from "../utils/config/config";
import LargeIconButton from "../common/LargeIconButton";
import RevealerRow from "../common/RevealerRow";

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
    if (theme.wallpaperDir === "") {
        return
    }
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
    const leftPadding = 18 - pixelAdjustment
    const rightPadding = 18 + pixelAdjustment

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
                return ["largeIconButtonSelected"]
            }
            return ["largeIconButton"]
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

function ThemeButton(
    {
        theme
    }:
    {
        theme: Theme,
    }
) {
    return <LargeIconButton
        icon={theme.icon}
        offset={theme.pixelOffset}
        selected={selectedTheme((t) => t === theme)}
        onClicked={() => {
            updateTheme(theme)
        }}/>
}

function ThemeOptions() {
    const themeRows = chunkEvenly(config.themes, 5)

    return <box
        vertical={true}
        spacing={4}>
        {themeRows.map((themeRow) => {
            return <box
                vertical={false}
                marginStart={20}
                marginEnd={20}
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
                return <box/>
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

    return <RevealerRow
        icon={selectedTheme((theme) => {
            return theme?.icon ?? ""
        })}
        iconOffset={selectedTheme((theme) => {
            return theme.pixelOffset
        })}
        windowName={SystemMenuWindowName}
        content={
            <label
                cssClasses={["labelMediumBold"]}
                halign={Gtk.Align.START}
                hexpand={true}
                ellipsize={Pango.EllipsizeMode.END}
                label="Look and Feel"/>
        }
        revealedContent={
            <box
                marginTop={10}
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
                <box
                    vertical={false}>
                    {Array.from({length: numberOfColumns}).map((_, index) => {
                        return <WallpaperColumn column={index}/>
                    })}
                </box>
            </box>
        }
    />
}