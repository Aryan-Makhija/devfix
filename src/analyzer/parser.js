import { parse } from "@babel/parser";

// in this code we are divinding the code into a proper structure  like this . So that we can defferentiate what are the dependencies and what are the expressions used in the code for the particular file type js and ts . We have used unambiguous here so that we can understand both  import and the expression used for it .
// │
// ├── ImportDeclaration
// │      └── "express"
// │
// ├── ImportDeclaration
// │      └── "unknown-package"
// │
// └── VariableDeclaration

export function parseSourceCode(sourceCode) {
    return parse(sourceCode, {
        sourceType: "unambiguous",
        plugins: [
            "jsx",
            "typescript"
        ]
    })
}

