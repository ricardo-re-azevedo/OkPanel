import {App, Astal, Gdk, Gtk} from "astal/gtk4";
import {Binding} from "astal";
import {config} from "../utils/config/config";
import {hideAllWindows} from "../utils/windows";

type Params = {
    monitor: number;
    windowName: string,
    anchor: Binding<Astal.WindowAnchor> | Astal.WindowAnchor,
    topExpand: Binding<boolean> | boolean,
    bottomExpand: Binding<boolean> | boolean,
    rightExpand: Binding<boolean> | boolean,
    leftExpand: Binding<boolean> | boolean,
    contentWidth: number,
    width: number,
    height: number,
    content?: JSX.Element;
}

export default function(
    {
        monitor,
        windowName,
        anchor,
        topExpand,
        bottomExpand,
        rightExpand,
        leftExpand,
        contentWidth,
        width,
        height,
        content,
    }: Params
) {
    let mainBox: Astal.Box

    return <window
        heightRequest={height}
        widthRequest={width}
        monitor={monitor}
        name={windowName}
        anchor={anchor}
        margin={config.windows.gaps}
        exclusivity={Astal.Exclusivity.NORMAL}
        layer={Astal.Layer.TOP}
        cssClasses={["transparentBackground"]}
        application={App}
        visible={false}
        keymode={Astal.Keymode.ON_DEMAND}
        onKeyPressed={function (self, key) {
            if (key === Gdk.KEY_Escape) {
                hideAllWindows()
            }
        }}
        setup={(self) => {
            const gesture = new Gtk.GestureClick();
            gesture.connect('pressed', (_gesture, n_press, x, y) => {
                const [_, childX, childY] = mainBox.translate_coordinates(self, 0, 0)
                const allocation = mainBox.get_allocation();
                const insideIgnoredChild =
                    x >= childX &&
                    x <= childX + allocation.width &&
                    y >= childY &&
                    y <= childY + allocation.height;

                if (insideIgnoredChild) {
                    print('Click was inside ignored child — ignoring.');
                    return;
                }
                print(`Box clicked at (${x}, ${y}) with ${n_press} presses`);
                hideAllWindows()
            });
            self.add_controller(gesture);
        }}>
        <box vertical={true}>
            <box vexpand={topExpand}/>
            <box
                vertical={false}>
                <box hexpand={leftExpand}/>
                <box
                    hexpand={false}
                    vertical={true}
                    cssClasses={["window"]}
                    setup={(self) => {
                        mainBox = self;
                    }}>
                    <Gtk.ScrolledWindow
                        cssClasses={["scrollWindow"]}
                        vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                        propagateNaturalHeight={true}
                        widthRequest={contentWidth}>
                        {content}
                    </Gtk.ScrolledWindow>
                </box>
                <box hexpand={rightExpand}/>
            </box>
            <box vexpand={bottomExpand}/>
        </box>
    </window>
}