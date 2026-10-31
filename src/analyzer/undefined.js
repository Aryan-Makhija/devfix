// this is a another layer before declaring a undefined fucntion/variable/dependency as missing imports because sometimes there is missing declared or imported function that is not the work of devfix for now 

import traverseModule from "@babel/traverse";

import { GLOBAL_IDENTIFIERS } from "./globals.js";

const traverse =
    traverseModule.default || traverseModule;

export function findUndefinedIdentifiers(ast) {
    const undefinedIdentifiers = new Map();

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

            if (!undefinedIdentifiers.has(name)) {
                undefinedIdentifiers.set(name, {
                    name,
                    occurrences: []
                });
            }

            undefinedIdentifiers
                .get(name)
                .occurrences
                .push(location);
        }
    });

    return [...undefinedIdentifiers.values()];
}