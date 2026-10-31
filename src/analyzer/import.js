
// In this file we are trying to solve the imports recoginistion in the file . to identify the different types of imports done in the file that are parsed by the AST parser 

import { classifyImport } from "./classify.js";
import { getPackageName } from "./package-name.js";
import { classifySpecifier } from "./specifiers.js";



export function analyzeImports(ast) {
    const imports = [];

    for (const node of ast.program.body) {
        if (node.type !== "ImportDeclaration") {
            continue;
        }
        const source = node.source.value
        const type = classifyImport(source)

        imports.push({
            source,
            type,
            packageName:
                type === "external"
                    ? getPackageName(source)
                    : null,
            specifiers: node.specifiers.map((specifier) => {
                return {
                    type: classifySpecifier(specifier),
                    local: specifier.local?.name,
                    imported: specifier.imported?.name
                };
            })
        });
    }

    return imports;
}