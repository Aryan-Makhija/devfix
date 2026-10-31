import { applyImportRepairs } from "./repair-applicator.js";

const repair = {
    name: "useState",
    source: "react",
    type: "named",
    importStatement: 'import { useState } from "react";'
};

const testCases = [
    {
        name: "Shebang preservation",
        source: `#!/usr/bin/env node

console.log(useState(0));
`,
        expectedApplied: 1
    },
    {
        name: "Directive preservation",
        source: `"use strict";

const value = useState(0);
`,
        expectedApplied: 1
    },
    {
        name: "Comment inside named import",
        source: `import {
    useEffect // existing hook
} from "react";

const value = useState(0);
`,
        expectedApplied: 1
    },
    {
        name: "Type-only import",
        source: `import type { User } from "./types";

const value = useState(0);
`,
        expectedApplied: 1
    },
    {
        name: "Regular named import",
        source: `import { useEffect } from "react";

const value = useState(0);
`,
        expectedApplied: 1
    }
];

for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);

    const result = applyImportRepairs(
        testCase.source,
        [repair]
    );

    console.log(result.code);

    console.log("Applied:", result.applied.length);
    console.log("Skipped:", result.skipped.length);

    console.log(
        "Test:",
        result.applied.length === testCase.expectedApplied
            ? "PASS"
            : "FAIL"
    );
}