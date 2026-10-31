import { applyImportRepairs } from "./repair-applicator.js";

import {
    generateRepairPreview,
    displayRepairPreview
} from "./repair-preview.js";

const originalCode = `import { useEffect } from "react";

const value = useState(0);
const memo = useMemo(() => value, [value]);
`;

const repairs = [
    {
        name: "useState",
        source: "react",
        type: "named",
        importStatement:
            'import { useState } from "react";'
    },
    {
        name: "useMemo",
        source: "react",
        type: "named",
        importStatement:
            'import { useMemo } from "react";'
    }
];

// Step 1: Apply repairs in memory
const repairResult = applyImportRepairs(
    originalCode,
    repairs
);

// Step 2: Generate preview
const preview = generateRepairPreview(
    "src/App.jsx",
    originalCode,
    repairResult.code
);

// Step 3: Display preview
displayRepairPreview(preview);

// Step 4: Display repair summary
console.log("\nRepair summary:");

console.log(
    `Applied: ${repairResult.applied.length}`
);

console.log(
    `Skipped: ${repairResult.skipped.length}`
);