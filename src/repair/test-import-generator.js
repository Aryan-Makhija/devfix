import {
    generateImportStatement
} from "./import-generator.js";

const namedImport =
    generateImportStatement({
        name: "useState",
        source: "react",
        type: "named",
        imported: "useState"
    });

const aliasedImport =
    generateImportStatement({
        name: "effect",
        source: "react",
        type: "named",
        imported: "useEffect"
    });

const defaultImport =
    generateImportStatement({
        name: "axios",
        source: "axios",
        type: "default",
        imported: null
    });

const namespaceImport =
    generateImportStatement({
        name: "ReactDOM",
        source: "react-dom",
        type: "namespace",
        imported: null
    });

console.log("\nGenerated imports:");

console.log(namedImport);
console.log(aliasedImport);
console.log(defaultImport);
console.log(namespaceImport);