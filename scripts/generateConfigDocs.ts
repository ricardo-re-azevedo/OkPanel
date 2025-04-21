import { writeFileSync } from "fs";
import { CONFIG_SCHEMA, Field } from "../ags/widget/utils/config/configSchema";

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

function flattenFields(fields: Field[], prefix = ""): Row[] {
    const rows: Row[] = [];

    for (const field of fields) {
        const baseName = prefix + field.name;
        const isArray = field.type === "array";
        const fullName = isArray ? `${baseName}[]` : baseName;

        let type: string = field.type;
        let extraRows: Row[] = [];

        // If it's an array, infer array type
        if (isArray && field.item) {
            const itemType = field.item.type;
            type = `array<${itemType}>`;

            // If array item is an enum, explain options
            if (itemType === "enum" && field.item.enumValues?.length) {
                extraRows.push({
                    name: `↳ Allowed values for \`${fullName}\``,
                    type: "",
                    default: "",
                    required: "",
                    description: field.item.enumValues.map((v) => `\`${v}\``).join(", "),
                });
            }

            // If array item is an object, recurse into it
            if (itemType === "object" && field.item.children) {
                extraRows.push(...flattenFields(field.item.children, `${fullName}.`));
            }
        }

        const row: Row = {
            name: `\`${fullName}\``,
            type,
            default: field.default !== undefined ? `\`${String(field.default)}\`` : "",
            required: field.required ? "✅" : "",
            description: field.description ? mdEscape(field.description) : "",
        };

        rows.push(row);
        rows.push(...extraRows);

        // For object fields, recurse
        if (field.type === "object" && field.children) {
            rows.push(...flattenFields(field.children, `${baseName}.`));
        }
    }

    return rows;
}


function generateDocs(schema: Field[]): string {
    const out: string[] = [];

    out.push("# 🛠 OkPanel Configuration Reference\n");
    out.push("_This file is auto-generated. Do not edit manually._\n");

    out.push("\n| Name | Type | Default | Required | Description |");
    out.push("|------|------|---------|----------|-------------|");

    const rows = flattenFields(schema);
    for (const r of rows) {
        out.push(`| ${r.name} | ${r.type} | ${r.default} | ${r.required} | ${r.description} |`);
    }

    return out.join("\n");
}

// Generate and write file
const markdown = generateDocs(CONFIG_SCHEMA);
writeFileSync(OUT_PATH, markdown);

console.log(`✅ Generated config docs to ${OUT_PATH}`);