// import { readSourceFile } from "../utils/file.js";
// import { parseSourceCode } from "./parser.js";
// import { findMissingImports } from "./missing-imports.js";

import { readSourceFile } from "../utils/file.js";
import { findMissingImports } from "./missing-imports.js";
import { parseSourceCode } from "./parser.js";

const filePath = new URL(
    "./test-missing-imports.js",
    import.meta.url
);

const sourceCode = await readSourceFile(filePath);

const ast = parseSourceCode(sourceCode);

const missingImports =
    findMissingImports(ast);

console.log("Potential missing imports:");

for (const name of missingImports) {
    console.log(`- ${name}`);
}