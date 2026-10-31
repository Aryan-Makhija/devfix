import { readSourceFile } from "../utils/file.js";
import { parseSourceCode } from "../analyzer/parser.js";

import { findImportCandidates } from "../analyzer/import-candidates.js";
import { resolveCandidates } from "./candidate-resolver.js";
import { analyzeImports } from "../analyzer/import.js";

const filePath = new URL(
    "../analyzer/test-missing-imports.js",
    import.meta.url
);

const sourceCode =
    await readSourceFile(filePath);

const ast = parseSourceCode(sourceCode);

const imports = analyzeImports(ast);

const candidates =
    findImportCandidates(ast);

const resolved =
    resolveCandidates(
        candidates,
        imports
    );

console.log("\nResolved candidates:");
console.dir(resolved, {
    depth: null
});