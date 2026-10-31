// What does this file do is that it merges the imports that belongs to same source like import {useState , useEffect} from "react"

import { parseSourceCode } from "../analyzer/parser.js";

export function mergeNamedImports(sourceCode, repairs) {
    let result = sourceCode;

    for (const repair of repairs) {
        if (repair.type !== "named") {
            continue;
        }

        const ast = parseSourceCode(result);

        const existingImport = ast.program.body.find(
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

        if (!existingImport) {
            continue;
        }

        // This will check is there any commend imports , or any imports is having any comments or not . 
        if (hasCommentsInsideImport(existingImport, result)) {
            continue;
        }

        const alreadyImported = existingImport.specifiers.some(
            (specifier) =>
                specifier.type === "ImportSpecifier" &&
                specifier.local.name === repair.name
        );

        if (alreadyImported) {
            continue;
        }

        const namedSpecifiers = existingImport.specifiers.filter(
            (specifier) =>
                specifier.type === "ImportSpecifier"
        );

        const lastSpecifier =
            namedSpecifiers[namedSpecifiers.length - 1];

        if (!lastSpecifier) {
            continue;
        }

        const importedName =
            repair.imported ?? repair.name;

        const newSpecifier =
            importedName === repair.name
                ? repair.name
                : `${importedName} as ${repair.name}`;

        const position = lastSpecifier.end;

        result =
            result.slice(0, position) +
            `, ${newSpecifier}` +
            result.slice(position);
    }

    return result;
}

function hasCommentsInsideImport(node, sourceCode) {
    const openingBrace = sourceCode.indexOf(
        "{",
        node.start
    );

    const closingBrace = sourceCode.indexOf(
        "}",
        openingBrace
    );

    if (
        openingBrace === -1 ||
        closingBrace === -1 ||
        closingBrace >= node.end
    ) {
        return true;
    }

    const content = sourceCode.slice(
        openingBrace,
        closingBrace
    );

    return (
        content.includes("//") ||
        content.includes("/*")
    );
}