import { writeFileSync } from "fs";
import { CONFIG_SCHEMA, Field } from "../ags/widget/utils/config/configSchema";

const OUT_PATH = "docs/config.md";

function mdEscape(s: string): string {
    return s.replace(/\|/g, "\\|").replace(/`/g, "\\`");
}

function formatTable(fields: Field[], depth = 0): string {
    const rows: string[] = [];

    if (depth > 0) {
        rows.push(`\n### ${"▪️ ".repeat(depth)} Subfields\n`);
    }

    rows.push(`| Name | Type | Default | Required | Description |`);
    rows.push(`|------|------|---------|----------|-------------|`);

    for (const field of fields) {
        const name = `\`${field.name}\``;
        const type = field.type;
        const def =
            field.default !== undefined
                ? `\`${String(field.default)}\``
                : "";
        const required = field.required ? "✅" : "";
        const desc = field.description ? mdEscape(field.description) : "";

        rows.push(`| ${name} | ${type} | ${def} | ${required} | ${desc} |`);

        if (field.type === "object" && field.children) {
            rows.push(formatTable(field.children, depth + 1));
        }

        if (field.type === "array" && field.item) {
            rows.push(`\n> Array of:\n`);
            rows.push(formatTable([field.item], depth + 1));
        }
    }

    return rows.join("\n");
}

function generateDocs(schema: Field[]): string {
    const out: string[] = [];
    out.push("# 🛠 OkPanel Configuration Reference\n");
    out.push("_This file is auto-generated. Do not edit manually._\n");

    for (const field of schema) {
        out.push(`\n## 🔹 \`${field.name}\` (${field.type})`);
        if (field.description) {
            out.push(`\n${mdEscape(field.description)}\n`);
        }

        out.push(formatTable([field]));
    }

    return out.join("\n");
}

// Generate and write file
const markdown = generateDocs(CONFIG_SCHEMA);
writeFileSync(OUT_PATH, markdown);

console.log(`✅ Generated config docs to ${OUT_PATH}`);