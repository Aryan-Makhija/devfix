import {
    prepareImportRepairs
} from "./repair-workflow.js";

const originalCode = `import { useEffect } from "react";

function App() {
    const [count, setCount] = useState(0);

    return count;
}
`;

const repairs = [
    {
        name: "useState",
        source: "react",
        type: "named",
        importStatement:
            'import { useState } from "react";'
    }
];

const result = await prepareImportRepairs(
    "src/App.jsx",
    originalCode,
    repairs
);

console.log("\nConfirmation result:");
console.log({
    approved: result.approved,
    changed: result.changed,
    applied: result.applied.length,
    skipped: result.skipped.length
});

if (result.approved) {
    console.log(
        "\nUser approved the proposed modifications."
    );
} else {
    console.log(
        "\nImport repairs were not approved."
    );
}

console.log("\nNo files were modified.");