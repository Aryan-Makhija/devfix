import traverseModule from "@babel/traverse";

import { GLOBAL_IDENTIFIERS } from "./globals.js";

const traverse =
    traverseModule.default || traverseModule;

export function findImportCandidates(ast) {
    const candidates = new Map();

    traverse(ast, {
        ReferencedIdentifier(path) {
            const name = path.node.name;

            if (GLOBAL_IDENTIFIERS.has(name)) {
                return;
            }

            if (path.scope.hasBinding(name)) {
                return;
            }

            const location = {
                line: path.node.loc?.start.line,
                column: path.node.loc?.start.column
            };

            if (!candidates.has(name)) {
                candidates.set(name, {
                    name,
                    occurrences: []
                });
            }

            candidates
                .get(name)
                .occurrences
                .push(location);
        }
    });

    return [...candidates.values()];
}