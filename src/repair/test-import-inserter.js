import { insertImports } from "./import-inserter.js";

const sourceCode = `


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
        importStatement: 'import { useState } from "react";'
    },
    {
        name: "useMemo",
        source: "react",
        type: "named",
        importStatement: 'import { useMemo } from "react";'
    }
];

const result = insertImports(sourceCode, repairs);

console.log("\nOriginal Source:\n");
console.log(sourceCode);

console.log("\nModified Source:\n");
console.log(result);