import {Binding} from "astal";

export default function(
    {
        icon,
        offset,
        selected,
        onClicked,
    }:
    {
        icon: Binding<string> | string,
        offset: number | Binding<number>,
        selected?: Binding<boolean>,
        onClicked: () => void
    }
) {
    return <button
        cssClasses={selected === undefined ?
            ["largeIconButton"] :
            selected.as((b) => b ? ["largeIconButtonSelected"] : ["largeIconButton"])}
        onClicked={onClicked}>
        <label
            marginTop={8}
            marginBottom={8}
            marginStart={typeof offset === 'number' ? 18 - offset : offset.as((value) => 18 - value)}
            marginEnd={typeof offset === 'number' ? 18 + offset : offset.as((value) => 18 + value)}
            label={icon}/>
    </button>
}