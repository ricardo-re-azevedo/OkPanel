import { writeFileSync } from "fs";
import { CONFIG_SCHEMA, Field } from "../ags/widget/utils/config/configSchema";

const INTRO = `# Configure

Create a config file and place it in the config directory like so

\`\`\`
~/.config/OkPanel/okpanel.conf
\`\`\`

## Config values

---
`;

const OUT_PATH = "docs/config.md";

function mdEscape(s: string): string {
    return s.replace(/\|/g, "\\|").replace(/`/g, "\\`");
}

type Row = {
    name: string;
    type: string;
    default: string;
    required: string;
    description: string;
};

function collectRow(field: Field): Row {
    const isArray = field.type === "array";
    const item = field.item;
    const enumVals = field.enumValues?.length ? field.enumValues : item?.enumValues;

    let baseType: string = field.type;

    if (isArray && item?.type === "enum") {
        baseType = `enum[(${item.enumValues!.map(v => `"${v}"`).join(", ")})]`;
    } else if (isArray && item) {
        baseType = `[${item.type}]`;
    } else if (field.type === "enum" && enumVals) {
        baseType = `enum (${enumVals.map(v => `"${v}"`).join(", ")})`;
    }

    return {
        name: field.name,
        type: baseType,
        default:
            field.default === undefined ||
            field.default === "" ||
            (Array.isArray(field.default) && field.default.length === 0)
                ? ""
                : Array.isArray(field.default)
                    ? field.default.map(String).join(" ")
                    : String(field.default),
        required: field.required ? "✔" : "x",
        description: mdEscape(field.description ?? ""),
    };
}

function collectChildren(field: Field): Row[] {
    if (field.type === "object" && field.children) {
        return field.children.map(collectRow);
    }

    if (field.type === "array" && field.item?.type === "object" && field.item.children) {
        return field.item.children.map(collectRow);
    }

    return [];
}

function formatTable(rows: Row[]): string[] {
    const header = ["Name", "Type", "Default", "Required", "Description"];

    const widths = header.map((_, i) =>
        Math.max(
            header[i].length,
            ...rows.map(row => [
                row.name,
                row.type,
                row.default,
                row.required,
                row.description,
            ][i]?.length || 0)
        )
    );

    const formatRow = (cols: string[]) =>
        `| ${cols.map((col, i) => col.padEnd(widths[i])).join(" | ")} |`;

    const lines: string[] = [];
    lines.push(formatRow(header));
    lines.push(`|${widths.map(w => "-".repeat(w + 2)).join("|")}|`);

    for (const row of rows) {
        lines.push(
            formatRow([
                row.name,
                row.type,
                row.default,
                row.required,
                row.description,
            ])
        );
    }

    return lines;
}

function generateDocs(schema: Field[]): string {
    const out: string[] = [];

    out.push(INTRO);

    // Top-level table for all non-object fields
    const topLevelRows: Row[] = [];
    const nestedSections: string[] = [];

    for (const field of schema) {
        const row = collectRow(field);
        const children = collectChildren(field);

        topLevelRows.push(row);

        if (children.length > 0) {
            nestedSections.push(`\n### ${field.name} (${row.type})`);
            if (field.description) {
                nestedSections.push(`\n${field.description}\n`);
            }
            nestedSections.push(...formatTable(children));
        }
    }

    // Main table
    out.push(...formatTable(topLevelRows));

    // Append nested sections
    out.push(...nestedSections);

    return out.join("\n");
}

// Generate and write file
const markdown = generateDocs(CONFIG_SCHEMA);
writeFileSync(OUT_PATH, markdown);

console.log(`✅ Generated config docs to ${OUT_PATH}`);