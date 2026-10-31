
// This file is working to find out the missing imports in the file means the dependency is used in the file but not imported are detected here 
import traverseModule from "@babel/traverse";

import { GLOBAL_IDENTIFIERS } from "./globals.js";

const traverse =
    traverseModule.default || traverseModule;

export function findMissingImports(ast) {
    const missing = new Map();

    traverse(ast, {
        ReferencedIdentifier(path) {
            const name = path.node.name;

            // Ignore known global/runtime identifiers
            if (GLOBAL_IDENTIFIERS.has(name)) {
                return;
            }

            // Ignore identifiers that already have a binding
            if (path.scope.hasBinding(name)) {
                return;
            }

            const location = {
                line: path.node.loc?.start.line,
                column: path.node.loc?.start.column
            };

            if (!missing.has(name)) {
                missing.set(name, {
                    name,
                    occurrences: []
                });
            }

            missing
                .get(name)
                .occurrences
                .push(location);
        }
    });

    return [...missing.values()];
}