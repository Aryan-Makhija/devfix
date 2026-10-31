import { applyImportRepairs } from "./repair-applicator.js";

const testCases = [
    {
        name: "Merge existing named import",

        source: `
import { useEffect } from "react";

const [count, setCount] = useState(0);
`,

        repairs: [
            {
                name: "useState",
                source: "react",
                type: "named",
                importStatement:
                    'import { useState } from "react";'
            }
        ]
    },

    {
        name: "Insert new import",

        source: `
const result = useMemo(() => 10, []);
`,

        repairs: [
            {
                name: "useMemo",
                source: "react",
                type: "named",
                importStatement:
                    'import { useMemo } from "react";'
            }
        ]
    },

    {
        name: "Multiple repairs",

        source: `
import { useEffect } from "react";

const [count, setCount] = useState(0);
const result = useMemo(() => count * 2, [count]);
`,

        repairs: [
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
        ]
    },

    {
        name: "Invalid import statement",

        source: `
const value = 10;
`,

        repairs: [
            {
                name: "invalid",
                source: "react",
                type: "named",
                importStatement:
                    "import { invalid from 'react';"
            }
        ]
    }
];

for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);

    const result = applyImportRepairs(
        testCase.source,
        testCase.repairs
    );

    console.log("Modified code:");
    console.log(result.code);

    console.log("Applied:", result.applied.length);
    console.log("Skipped:", result.skipped.length);

    if (result.skipped.length > 0) {
        console.log("Reasons:");

        for (const item of result.skipped) {
            console.log(`- ${item.reason}`);
        }
    }
}