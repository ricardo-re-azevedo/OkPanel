import {bind, Binding, Variable} from "astal";
import {App, Gtk} from "astal/gtk4";
import {SystemMenuWindowName} from "../systemMenu/SystemMenuWindow";
import LargeIconButton from "./LargeIconButton";

type Params = {
    icon: string | Binding<string>;
    iconOffset: number;
    onClick?: () => void;
    content?: JSX.Element;
    revealedContent?: JSX.Element;
}

export default function (
    {
        icon,
        iconOffset,
        onClick,
        content,
        revealedContent,
    }: Params
) {
    const revealed = Variable(false)

    setTimeout(() => {
        bind(App.get_window(SystemMenuWindowName)!, "visible").subscribe((visible) => {
            if (!visible) {
                revealed.set(false)
            }
        })
    }, 1_000)

    const leftPadding = 18 - iconOffset
    const rightPadding = 18 + iconOffset

    return <box
        vertical={true}>
        <box
            vertical={false}
            cssClasses={["row"]}>
            {onClick !== undefined ?
                <LargeIconButton
                    offset={iconOffset}
                    icon={icon}
                    onClicked={() => {
                        onClick()
                    }}/>
            : <label
                    marginTop={8}
                    marginBottom={8}
                    marginStart={leftPadding}
                    marginEnd={rightPadding + 10}
                    cssClasses={["largeIconLabel"]}
                    label={icon}/>
            }
            {content}
            <button
                cssClasses={["iconButton"]}
                label={revealed((revealed): string => {
                    if (revealed) {
                        return ""
                    } else {
                        return ""
                    }
                })}
                onClicked={() => {
                    revealed.set(!revealed.get())
                }}/>
        </box>
        <revealer
            marginTop={10}
            cssClasses={["rowRevealer"]}
            revealChild={revealed()}
            transitionDuration={200}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
            {revealedContent}
        </revealer>
    </box>
}