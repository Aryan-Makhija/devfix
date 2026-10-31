import { readSourceFile } from "../utils/file.js";
import { findMissingDependencies } from "./dependencies.js";
import { findImportCandidates } from "./import-candidates.js";
import { analyzeImports } from "./import.js";
import { findMissingImports } from "./missing-imports.js";
import { parseSourceCode } from "./parser.js";
import { findUndefinedIdentifiers } from "./undefined.js";
import { findImportsByLocalName } from "./import-lookup.js";
export async function analyzeFile(
    filePath,
    declaredDependencies
) {
    const sourceCode = await readSourceFile(filePath);

    const ast = parseSourceCode(sourceCode);

    const imports = analyzeImports(ast);

    const missingImports = findMissingImports(ast);

    const missingDependencies =
        findMissingDependencies(
            imports,
            declaredDependencies
        );

    const undefinedIdentifiers =
        findUndefinedIdentifiers(ast);
    const importCandidates =
        findImportCandidates(ast);

    return {
        filePath,
        imports,
        missingImports,
        missingDependencies,
        undefinedIdentifiers, importCandidates
    };
}


export async function analyzeFiles(
    filePaths,
    declaredDependencies
) {
    const results = [];

    for (const filePath of filePaths) {
        const result = await analyzeFile(
            filePath,
            declaredDependencies
        );

        results.push(result);
    }

    return results;
}


// This function will keep the path from where the dependency issue occured
export function aggregateMissingDependencies(
    fileResults
) {
    const dependencies = new Map();

    for (const result of fileResults) {
        for (const dependency of result.missingDependencies) {
            if (!dependencies.has(dependency)) {
                dependencies.set(dependency, []);
            }

            dependencies
                .get(dependency)
                .push(result.filePath);
        }
    }

    return dependencies;
}

export function aggregateMissingImports(
    fileResults
) {
    const imports = new Map();

    for (const result of fileResults) {
        for (const missingImport of result.missingImports) {
            const name = missingImport.name;

            if (!imports.has(name)) {
                imports.set(name, []);
            }

            imports.get(name).push({
                filePath: result.filePath,
                occurrences: missingImport.occurrences
            });
        }
    }

    return imports;
}

export function createAnalysisResult(
    fileResults
) {
    const missingDependencies =
        aggregateMissingDependencies(fileResults);

    const missingImports = aggregateMissingImports(fileResults);

    return {
        files: fileResults,
        missingDependencies,
        missingImports
    };
}







//================================================================================================
// What actually analzying phase provide the the result that can be understand with the  help of a example like :->

// import { useEffect } from "react";
// import axios from "axios";

// function App() {
//     useEffect(() => {});
//     useState(0);
//     axios.get("/api");
// }

// Existing imports:
//     useEffect → react
//     axios    → axios

// Candidates:
//     useState
//===================================================================================================