// This  file inserts the imports in the source code , we are also adding a safety layer in the import statement such that it will not affect the source coed import strucuture like if file usese shebangs , " use cliets" like such statements than that must remain at the top of the page so the imports comes after it , it also handles the comments and other typescript safety declaration 


import { parseSourceCode } from "../analyzer/parser.js";

function getInsertionPosition(sourceCode, ast) {
    const imports = ast.program.body.filter(
        (node) => node.type === "ImportDeclaration"
    );

    // Case 1: Insert after the last existing import
    if (imports.length > 0) {
        return imports[imports.length - 1].end;
    }

    // Case 2: No imports — preserve shebang and directives
    let position = 0;

    if (ast.program.interpreter) {
        position = ast.program.interpreter.end;
    }

    const directives = ast.program.directives ?? [];

    if (directives.length > 0) {
        position = Math.max(
            position,
            directives[directives.length - 1].end
        );
    }

    return position;
}

export function insertImports(sourceCode, repairs) {
    if (!repairs.length) {
        return sourceCode;
    }

    const ast = parseSourceCode(sourceCode);

    const statements = repairs.map(
        (repair) => repair.importStatement
    );

    const newImports = statements.join("\n");

    const position = getInsertionPosition(
        sourceCode,
        ast
    );

    // Preserve original content before insertion
    const before = sourceCode.slice(0, position);
    const after = sourceCode.slice(position);

    if (position === 0) {
        return `${newImports}\n\n${sourceCode}`;
    }

    return `${before}\n${newImports}${after}`;
}