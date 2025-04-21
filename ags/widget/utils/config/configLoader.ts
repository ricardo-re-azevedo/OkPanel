import {Config, CONFIG_SCHEMA, Field, PrimitiveType} from "./newConfig";
import {readFile} from "astal/file";


// ───────────────────────── helpers ─────────────────────────
const stripQuotes = (s: string) => s.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

function castPrimitive(value: string, target: PrimitiveType) {
    switch (target) {
        case 'number': {
            const n = Number(value);
            if (Number.isNaN(n)) throw new Error(`Expected number, got "${value}"`);
            return n;
        }
        case 'boolean':
            if (value === 'true' || value === 'false') return value === 'true';
            throw new Error(`Expected boolean, got "${value}"`);
        default:
            return stripQuotes(value);
    }
}

function parseInlineValue(raw: string): any {
    const t = raw.trim();
    if (/^\[.*\]$/.test(t)) {
        const inner = t.slice(1, -1);
        return inner
            .split(/,(?=(?:[^'\"]|'[^']*'|"[^"]*")*$)/)
            .map((s) => stripQuotes(s.trim()))
            .filter((s) => s !== '');
    }
    return t;
}

// ───────────────────────── parser ─────────────────────────
export function parseConf(text: string): Record<string, any> {
    const root: any = {};
    const ctxStack: any[] = [root];
    const typeStack: ('object' | 'array')[] = ['object'];

    const put = (path: string[], value: any) => {
        let cur = ctxStack[ctxStack.length - 1];
        path.forEach((k, i) => {
            if (i === path.length - 1) {
                cur[k] = value;
            } else {
                if (cur[k] == null) cur[k] = {};
                cur = cur[k];
            }
        });
    };

    const lines = text.split(/\r?\n/);
    lines.forEach((raw, idx) => {
        const line = raw.trim();
        if (!line || line.startsWith('#') || line.startsWith(';')) return;

        const curType = () => typeStack[typeStack.length - 1];

        // Array end ] or ],
        if (/^],?\s*$/.test(line)) {
            if (curType() !== 'array') throw new Error(`Unexpected ] at line ${idx + 1}`);
            ctxStack.pop();
            typeStack.pop();
            return;
        }

        // Object end } or },
        if (/^},?\s*$/.test(line)) {
            if (curType() !== 'object') throw new Error(`Unexpected } at line ${idx + 1}`);
            const finished = ctxStack.pop(); // the object we just closed
            typeStack.pop();
            const parent = ctxStack[ctxStack.length - 1];
            // Push to parent array only if not already present (avoids duplicates)
            if (Array.isArray(parent) && parent[parent.length - 1] !== finished) {
                parent.push(finished);
            } // add to array if parent is array
            return;
        }

        // Block open   foo {   or   foo.bar {
        const openBlock = line.match(/^([\w.]+)\s*{\s*$/);
        if (openBlock) {
            const path = openBlock[1].split('.');
            const obj: any = {};
            put(path, obj);
            ctxStack.push(obj);
            typeStack.push('object');
            return;
        }

        // Object assignment start  key = {
        const objStart = line.match(/^([^=]+?)\s*=\s*{\s*$/);
        if (objStart) {
            const path = objStart[1].trim().split('.');
            const obj: any = {};
            put(path, obj);
            ctxStack.push(obj);
            typeStack.push('object');
            return;
        }

        // Array assignment start  key = [
        const arrayStart = line.match(/^([^=]+?)\s*=\s*\[\s*$/);
        if (arrayStart) {
            const path = arrayStart[1].trim().split('.');
            const arr: any[] = [];
            put(path, arr);
            ctxStack.push(arr);
            typeStack.push('array');
            return;
        }

        // Object open inside array (anonymous object)
        if (curType() === 'array' && line.startsWith('{')) {
            const obj: any = {};
            ctxStack[ctxStack.length - 1].push(obj);
            ctxStack.push(obj);
            typeStack.push('object');
            return;
        }

        // Regular assignment
        const kv = line.match(/^([^=]+?)\s*=\s*(.+)$/);
        if (!kv) throw new Error(`Invalid line ${idx + 1}: ${line}`);
        const [, rawKey, rawVal] = kv;
        const path = rawKey.trim().split('.');
        const val = parseInlineValue(rawVal);
        put(path, val);
    });

    if (ctxStack.length !== 1) throw new Error('Unclosed block/array');
    return root;
}

// ───────────────────────── validation ─────────────────────────
export function validateAndApplyDefaults<T>(raw: Record<string, any>, schema: Field[]): T {
    const out: any = {};
    const recurse = (r: any, s: Field[]): any => validateAndApplyDefaults(r ?? {}, s);

    for (const f of schema) {
        const key = f.name;
        const rv = raw?.[key];

        // ── Missing key ─────────────────────────────────────────────
        if (rv === undefined) {
            if (f.type === 'object') {
                // Even if not explicitly provided, build object from child defaults
                out[key] = recurse({}, f.children ?? []);
                continue;
            }
            if (f.default !== undefined) {
                out[key] = f.default;
                continue;
            }
            if (f.required) throw new Error(`Missing required: ${key}`);
            out[key] = undefined;
            continue;
        }

        // ── Present key – validate according to type ────────────────
        switch (f.type) {
            case 'string':
            case 'number':
            case 'boolean':
                out[key] = castPrimitive(String(rv), f.type);
                break;

            case 'enum':
                if (!f.enumValues!.includes(rv)) throw new Error(`Invalid value for ${key}: ${rv}`);
                out[key] = rv;
                break;

            case 'object':
                out[key] = recurse(rv, f.children ?? []);
                break;

            case 'array': {
                if (!Array.isArray(rv)) throw new Error(`Expected array for ${key}`);
                const item = f.item!;
                out[key] = rv.map((v) => {
                    if (item.type === 'enum') {
                        if (!item.enumValues!.includes(v)) throw new Error(`Invalid value in ${key}: ${v}`);
                        return v;
                    }
                    if (item.type === 'object') return recurse(v, item.children ?? []);
                    return castPrimitive(String(v), item.type as PrimitiveType);
                });
                break;
            }
        }
    }
    return out as T;
}

// ────────────────────────────────────────────────────────────────────────────
// Public helper – load & validate config from file
// ────────────────────────────────────────────────────────────────────────────
export function loadConfig(path: string): Config {
    const text = readFile(path) ?? "";
    const raw = parseConf(text);
    return validateAndApplyDefaults(raw, CONFIG_SCHEMA);
}
