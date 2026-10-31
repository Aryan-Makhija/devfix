// This file play an import role in importing the imports it check which action to take that is merge or insert , means it the same source import is already present than the merge import will work , if not than a new imoport statemnet is written in the code . 


import { parseSourceCode } from "../analyzer/parser.js";
import { checkRepairSafety } from "./repair-safety.js";
import { mergeNamedImports } from "./import-merger.js";
import { insertImports } from "./import-inserter.js";

function hasCompatibleNamedImport(ast, repair) {
    return ast.program.body.some(
        (node) =>
            node.type === "ImportDeclaration" &&
            node.source.value === repair.source &&
            node.importKind !== "type" &&
            node.specifiers.some(
                (specifier) =>
                    specifier.type === "ImportSpecifier" &&
                    specifier.importKind !== "type"
            )
    );
}

export function applyImportRepairs(sourceCode, repairs) {
    let result = sourceCode;

    const applied = [];
    const skipped = [];

    for (const repair of repairs) {
        const previousCode = result;

        try {
            // 1. Check repair safety
            const safety = checkRepairSafety(
                result,
                repair
            );

            if (!safety.safe) {
                skipped.push({
                    repair,
                    reason: safety.reason
                });

                continue;
            }

            // 2. Parse current source
            const ast = parseSourceCode(result);

            const canMerge =
                repair.type === "named" &&
                hasCompatibleNamedImport(ast, repair);

            // 3. Generate modified source
            let modifiedCode;

            if (canMerge) {
                // First attempt to merge
                modifiedCode = mergeNamedImports(result, [repair]);

                // If merging was skipped, insert a separate import
                if (modifiedCode === result) {
                    modifiedCode = insertImports(result, [repair]);
                }
            } else {
                // No compatible import exists
                modifiedCode = insertImports(result, [repair]);
            }

            // 4. Detect no-op repairs
            if (modifiedCode === result) {
                skipped.push({
                    repair,
                    reason: "no_change"
                });

                continue;
            }

            // 5. Validate modified source
            parseSourceCode(modifiedCode);

            // 6. Accept modification
            result = modifiedCode;

            applied.push(repair);

        } catch (error) {
            result = previousCode;

            skipped.push({
                repair,
                reason: error.message
            });
        }
    }

    return {
        code: result,
        applied,
        skipped
    };
}