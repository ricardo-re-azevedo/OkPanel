import {bind, Binding, Variable} from "astal";
import {App, Gtk} from "astal/gtk4";
import LargeIconButton from "./LargeIconButton";

type Params = {
    icon: string | Binding<string>;
    iconOffset: number | Binding<number>;
    windowName: string;
    setup?: (revealed: Variable<boolean>) => void;
    onClick?: () => void;
    content?: JSX.Element;
    revealedContent?: JSX.Element;
}

export default function (
    {
        icon,
        iconOffset,
        windowName,
        setup,
        onClick,
        content,
        revealedContent,
    }: Params
) {
    const revealed = Variable(false)

    if (setup) {
        setup(revealed)
    }

    setTimeout(() => {
        bind(App.get_window(windowName)!, "visible").subscribe((visible) => {
            if (!visible) {
                revealed.set(false)
            }
        })
    }, 1_000)

    return <box
        vertical={true}>
        <box
            vertical={false}>
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
                    marginStart={typeof iconOffset === 'number' ? 18 - iconOffset : iconOffset.as((value) => 18 - value)}
                    marginEnd={typeof iconOffset === 'number' ? 18 - iconOffset : iconOffset.as((value) => 18 + value)}
                    cssClasses={["largeIconLabel"]}
                    label={icon}/>
            }
            <box marginEnd={10}/>
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
            marginStart={10}
            marginEnd={10}
            revealChild={revealed()}
            transitionDuration={200}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
            {revealedContent}
        </revealer>
    </box>
}