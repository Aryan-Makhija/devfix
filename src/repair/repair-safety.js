// this file basiclly handles the duplicate imports and unwanterd imoprts to be added in the source code



import { parseSourceCode } from "../analyzer/parser.js";
import traverseModule from "@babel/traverse";

const traverse =
    traverseModule.default ?? traverseModule;

export function checkRepairSafety(sourceCode, repair) {
    const ast = parseSourceCode(sourceCode);

    if (
        !repair ||
        !["named", "default", "namespace"].includes(repair.type) ||
        typeof repair.name !== "string" ||
        typeof repair.source !== "string" ||
        !repair.name ||
        !repair.source
    ) {
        return {
            safe: false,
            reason: "invalid_repair"
        };
    }

    let existingBinding = null;

    traverse(ast, {
        Program(path) {
            existingBinding = path.scope.getBinding(
                repair.name
            );

            path.stop();
        }
    });

    if (existingBinding) {
        const bindingPath = existingBinding.path;

        const isImport =
            bindingPath.isImportSpecifier() ||
            bindingPath.isImportDefaultSpecifier() ||
            bindingPath.isImportNamespaceSpecifier();

        return {
            safe: false,
            reason: isImport
                ? "already_imported"
                : "binding_conflict"
        };
    }

    return {
        safe: true,
        reason: null
    };
}