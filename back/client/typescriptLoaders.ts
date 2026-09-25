import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import {
    ApplicationCommandManager,
    BaseCommandManager,
    ForgeFunctionManager
} from "@tryforge/forgescript";

const require = createRequire(import.meta.url);
let loadersInstalled = false;

function getTypeScriptFiles(directory: string): string[] {
    return readdirSync(resolve(directory), { withFileTypes: true }).flatMap((entry) => {
        const entryPath = resolve(directory, entry.name);
        if (entry.isDirectory()) return getTypeScriptFiles(entryPath);
        if (!entry.name.endsWith(".ts") || entry.name.endsWith(".d.ts")) return [];
        return [entryPath];
    });
}

function requireTypeScript(filePath: string): unknown {
    return require(resolve(filePath)) as Record<string, unknown>;
}

function getExports(value: unknown): unknown[] {
    const imported = value as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(imported, "default")) return [];

    const exported = imported.default;
    if (exported === null || exported === undefined) return [];
    if (typeof exported !== "object" && typeof exported !== "function") return [];
    if (Array.isArray(exported)) return exported;
    return Object.keys(exported).length ? [exported] : [];
}

/**
 * ForgeScript's built-in folder loaders only discover .js files. These
 * adapters let its existing managers register this project's .ts modules
 * directly under Node's native TypeScript runtime.
 */
export function installTypeScriptModuleLoaders(): void {
    if (loadersInstalled) return;
    loadersInstalled = true;

    const commandPrototype = BaseCommandManager.prototype as any;
    commandPrototype.load = function loadTypeScriptCommands(directory: string): void {
        if (!this.paths.includes(directory)) this.paths.push(directory);

        for (const filePath of getTypeScriptFiles(directory)) {
            const commands = getExports(requireTypeScript(filePath));
            if (commands.length) this.addPath(true, filePath, ...commands);
        }
    };

    const functionPrototype = ForgeFunctionManager.prototype as any;
    functionPrototype.load = function loadTypeScriptFunctions(directory: string): void {
        const functions: unknown[] = [];

        for (const filePath of getTypeScriptFiles(directory)) {
            functions.push(...getExports(requireTypeScript(filePath)));
        }

        if (functions.length) this.add(functions);
    };

    const applicationPrototype = ApplicationCommandManager.prototype as any;
    const loadApplicationCommand = applicationPrototype.loadOne;
    applicationPrototype.loadOne = function loadTypeScriptApplicationCommand(filePath: string): unknown {
        if (!filePath.endsWith(".ts")) return loadApplicationCommand.call(this, filePath);

        const commands = getExports(requireTypeScript(filePath));
        if (!commands.length) return null;
        if (commands.length > 1 || Array.isArray(commands[0])) throw new Error("Disallowed");
        return this.resolve(commands[0], filePath);
    };
}
