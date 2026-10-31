import { applyImportRepairs } from "./repair-applicator.js";

const repair = {
    name: "useState",
    source: "react",
    type: "named",
    importStatement: 'import { useState } from "react";'
};

const testCases = [
    {
        name: "Import already exists",
        source: `
import { useState } from "react";

const value = useState(0);
`,
        expectedApplied: 0,
        expectedReason: "already_imported"
    },
    {
        name: "Existing import uses alias",
        source: `
import { useState as stateHook } from "react";

const value = useState(0);
`,
        expectedApplied: 1,
        expectedReason: null
    },
    {
        name: "Local binding conflict",
        source: `
const useState = () => {};

const value = useState();
`,
        expectedApplied: 0,
        expectedReason: "binding_conflict"
    },
    {
        name: "Missing import",
        source: `
const value = useState(0);
`,
        expectedApplied: 1,
        expectedReason: null
    },
    {
        name: "Multiple repairs for same identifier",
        source: `
const value = useState(0);
`,
        repairs: [repair, repair],
        expectedApplied: 1,
        expectedReason: "already_imported"
    }
];

for (const testCase of testCases) {
    const result = applyImportRepairs(
        testCase.source,
        testCase.repairs ?? [repair]
    );

    console.log(`\n--- ${testCase.name} ---`);
    console.log(result.code);

    console.log("Applied:", result.applied.length);
    console.log("Skipped:", result.skipped.length);

    if (result.skipped.length > 0) {
        console.log(
            "Skip reasons:",
            result.skipped.map(item => item.reason)
        );
    }

    const appliedMatches =
        result.applied.length === testCase.expectedApplied;

    const reasonMatches =
        testCase.expectedReason === null ||
        result.skipped.some(
            item => item.reason === testCase.expectedReason
        );

    console.log(
        "Test:",
        appliedMatches && reasonMatches
            ? "PASS"
            : "FAIL"
    );
}