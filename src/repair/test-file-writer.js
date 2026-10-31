import fs from "node:fs/promises";
import path from "node:path";

import {
    executeImportRepairs
} from "./repair-workflow.js";

const filePath = path.resolve(
    "devfix-writer-test/App.jsx"
);

// Read original source
const originalCode = await fs.readFile(
    filePath,
    "utf8"
);

const repairs = [
    {
        name: "useState",
        source: "react",
        type: "named",
        importStatement:
            'import { useState } from "react";'
    }
];

const result = await executeImportRepairs(
    filePath,
    originalCode,
    repairs
);

console.log("\nFile writer result:");
console.log(result);

// Read final source
const finalCode = await fs.readFile(
    filePath,
    "utf8"
);

console.log("\nFinal source code:\n");
console.log(finalCode);