import { mergeNamedImports } from "./import-merger.js";

const testCases = [
    {
        name: "Merge named import",
        source: 'import { useEffect } from "react";\n',
        repairs: [
            {
                name: "useState",
                source: "react",
                type: "named"
            }
        ]
    },
    {
        name: "Merge multiple named imports",
        source: 'import { useEffect } from "react";\n',
        repairs: [
            {
                name: "useState",
                source: "react",
                type: "named"
            },
            {
                name: "useMemo",
                source: "react",
                type: "named"
            }
        ]
    },
    {
        name: "Merge aliased import",
        source: 'import { useEffect } from "react";\n',
        repairs: [
            {
                name: "myState",
                imported: "useState",
                source: "react",
                type: "named"
            }
        ]
    },
    {
        name: "Ignore unrelated source",
        source: 'import { useEffect } from "react";\n',
        repairs: [
            {
                name: "map",
                source: "lodash",
                type: "named"
            }
        ]
    }
];

for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);

    const result = mergeNamedImports(
        testCase.source,
        testCase.repairs
    );

    console.log(result);
}