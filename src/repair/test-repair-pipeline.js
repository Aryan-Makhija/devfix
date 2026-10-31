import { readSourceFile } from "../utils/file.js";
import { parseSourceCode } from "../analyzer/parser.js";
import { analyzeImports } from "../analyzer/import.js";
import { findImportCandidates } from "../analyzer/import-candidates.js";

import {
    resolveCandidates
} from "../resolver/candidate-resolver.js";

import {
    createRepairPlan
} from "./repair-planner.js";

const filePath = new URL(
    "../analyzer/test-missing-imports.js",
    import.meta.url
);

const sourceCode =
    await readSourceFile(filePath);

const ast =
    parseSourceCode(sourceCode);

const imports =
    analyzeImports(ast);

const candidates =
    findImportCandidates(ast);

const resolutions =
    resolveCandidates(
        candidates,
        imports
    );

const repairPlan =
    createRepairPlan(
        resolutions,
        imports
    );

console.log("\n=== IMPORTS ===");

console.dir(imports, {
    depth: null
});

console.log("\n=== CANDIDATES ===");

console.dir(candidates, {
    depth: null
});

console.log("\n=== RESOLUTIONS ===");

console.dir(resolutions, {
    depth: null
});

console.log("\n=== REPAIR PLAN ===");

console.dir(repairPlan, {
    depth: null
});