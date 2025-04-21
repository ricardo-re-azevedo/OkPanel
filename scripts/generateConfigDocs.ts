import { writeFileSync } from "fs";
import { CONFIG_SCHEMA, Field } from "../ags/widget/utils/config/configSchema";

const OUT_PATH = "docs/oldConfig.md";

function mdEscape(s: string): string {
    return s.replace(/[`]/g, "\\`");
}

function formatField(field: Field, indent = 0): string {
    const pad = "  ".repeat(indent);
    const lines: string[] = [];

    const header = `${pad}- \`${field.name}\` (${field.type})`;
    lines.push(header);

    if (field.description)
        lines.push(`${pad}  — ${mdEscape(field.description)}`);

    if (field.default !== undefined)
        lines.push(`${pad}  - Default: \`${String(field.default)}\``);

    if (field.required)
        lines.push(`${pad}  - Required`);

    if (field.type === "enum" && field.enumValues?.length) {
        const enums = field.enumValues.map((v) => `\`${v}\``).join(", ");
        lines.push(`${pad}  - Allowed: ${enums}`);
    }

    if (field.type === "object" && field.children) {
        for (const child of field.children) {
            lines.push(formatField(child, indent + 1));
        }
    }

    if (field.type === "array" && field.item) {
        lines.push(`${pad}  - Array items:\n${formatField(field.item, indent + 1)}`);
    }

    return lines.join("\n");
}

function generateDocs(schema: Field[]): string {
    const out: string[] = [];
    out.push("# OkPanel Configuration Reference\n");
    out.push("_This file is auto-generated. Do not edit manually._\n");

    for (const field of schema) {
        out.push(formatField(field));
        out.push(""); // blank line between top-level fields
    }

    return out.join("\n");
}

// Generate and write file
const markdown = generateDocs(CONFIG_SCHEMA);
writeFileSync(OUT_PATH, markdown);

console.log(`✅ Generated config docs to ${OUT_PATH}`);