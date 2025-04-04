import {Binding} from "astal";

export default function(
    {
        icon,
        offset,
        selected,
        onClicked,
    }:
    {
        icon: Binding<string>,
        offset: number,
        selected?: Binding<boolean>,
        onClicked: () => void
    }
) {
    const leftPadding = 18 - offset
    const rightPadding = 18 + offset
    return <button
        cssClasses={selected === undefined ?
            ["largeIconButton"] :
            selected.as((b) => b ? ["largeIconButtonSelected"] : ["largeIconButton"])}
        onClicked={onClicked}>
        <label
            marginTop={8}
            marginBottom={8}
            marginStart={leftPadding}
            marginEnd={rightPadding}
            label={icon}/>
    </button>
}