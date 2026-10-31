// import { readSourceFile } from "../utils/file.js";
// import { parseSourceCode } from "./parser.js";
// import { analyzeImports } from "./imports.js";
// import { findImportsByLocalName } from "./import-lookup.js";

import { readSourceFile } from "../utils/file.js";
import { analyzeImports } from "./import.js";
import { findImportsByLocalName } from "./import-lookup.js";
import { parseSourceCode } from "./parser.js";
import { findImportsByImportedName } from "./imported-name-lookup.js";
const filePath = new URL(
    "./test-imports.js",
    import.meta.url
);

const sourceCode =
    await readSourceFile(filePath);

const ast = parseSourceCode(sourceCode);

const imports = analyzeImports(ast);

const effectImports =
    findImportsByLocalName(
        imports,
        "effect"
    );
const axiosImports =
    findImportsByLocalName(
        imports,
        "axios"
    );

const stateImports =
    findImportsByLocalName(
        imports,
        "useState"
    );
const useEffectImports =
    findImportsByImportedName(
        imports,
        "useEffect"
    );

const useStateImports =
    findImportsByImportedName(
        imports,
        "useState"
    );
console.log("\nImport lookup:");

console.log("useEffect:", effectImports);
console.log("axios:", axiosImports);
console.log("useState:", stateImports);
console.log("\nImported-name lookup:");

console.log(
    "useEffect:",
    useEffectImports
);

console.log(
    "useState:",
    useStateImports
);