import { readSourceFile } from "../utils/file.js";
import { parseSourceCode } from "./parser.js";
import { analyzeImports } from "./import.js";
import { getImportedSources } from "./import-source.js";


const filePath = new URL(
    "./test-imports.js",
    import.meta.url
);

const sourceCode =
    await readSourceFile(filePath);

const ast = parseSourceCode(sourceCode);

const imports = analyzeImports(ast);

const sources = getImportedSources(imports);

console.log("\nImported sources:");
console.log(sources); X