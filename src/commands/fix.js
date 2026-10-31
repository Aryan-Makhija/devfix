import { aggregateMissingDependencies, analyzeFiles, createAnalysisResult } from "../analyzer/analyze.js";
import { findMissingDependencies } from "../analyzer/dependencies.js";
import { analyzeImports } from "../analyzer/import.js";
import { parseSourceCode } from "../analyzer/parser.js";
import { scanTarget } from "../scanner/scanner.js";
import { getDeclaredDependencies, readPackageJson } from "../utils/dependencies.js";
import { handleCommandError } from "../utils/errors.js";
import { readSourceFile } from "../utils/file.js";
import { findPackageJson, findSourceFiles, getCurrentDirectory } from "../utils/project.js";
import { resolveTarget, validateTarget } from "../utils/target.js";

import { repairDependencies } from "../dependency/dependency-repair.js";
import path from "node:path";

import {
    collectImportedDependencies
} from "../dependency/imported-dependencies.js";

import {
    repairMissingImports
} from "../repair/import-repair.js";
async function fixCommands(target) {

    try {


        console.log("Scanning Projects.... ")

        const currentDirectory = getCurrentDirectory();
        console.log(`Current Directory: ${currentDirectory}`);

        const packageJson = await findPackageJson(currentDirectory);

        if (!packageJson) {
            console.log("package.json not found.");
            return;
        }

        console.log(`package.json found: ${packageJson}`);
        const packageJsonData = await readPackageJson(packageJson);

        const dependencies =
            getDeclaredDependencies(packageJsonData);

        console.log(
            `Declared dependencies: ${Object.keys(dependencies).length}`
        );

        for (const dependency of Object.keys(dependencies)) {
            console.log(`- ${dependency}`);
        }

        const resolvedTarget = await resolveTarget(
            target,
            currentDirectory
        );


        // validating  the  resolved target path 
        const validation = validateTarget(resolvedTarget);

        if (!validation.valid) {
            console.log(`Error: ${validation.reason}`);
            return;
        }

        console.log(`Target type: ${resolvedTarget.type}`);
        console.log(`Target path: ${resolvedTarget.path}`);

        const sourceFiles = await scanTarget(resolvedTarget);

        console.log(`Source files found: ${sourceFiles.length}`);


        // for (const file of sourceFiles) {
        //     console.log(`\nAnalyzing: ${file}`);

        //     const sourceCode = await readSourceFile(file);

        //     console.log(`Source length: ${sourceCode.length}`);

        //     const ast = parseSourceCode(sourceCode);

        //     const imports = analyzeImports(ast);

        //     const missingDependencies =
        //         findMissingDependencies(
        //             imports,
        //             dependencies
        //         );

        //     console.log(
        //         `Missing dependencies: ${missingDependencies.length}`
        //     );

        //     for (const dependency of missingDependencies) {
        //         console.log(`⚠ ${dependency}`);
        //     }

        //     console.log(`Imports found: ${imports.length}`);

        //     for (const importInfo of imports) {
        //         console.log(`- ${importInfo.source} → ${importInfo.type}`);
        //     }

        // }

        const fileResults = await analyzeFiles(
            sourceFiles,
            dependencies
        );

        const analysisResult =
            createAnalysisResult(fileResults);

        console.log("\nMissing dependencies:");

        if (analysisResult.missingDependencies.size === 0) {
            console.log("None");
        } else {
            for (const [
                dependency,
                files
            ] of analysisResult.missingDependencies) {
                console.log(`- ${dependency}`);

                for (const file of files) {
                    console.log(`  used in: ${file}`);
                }
            }
        }

        console.log("\nPotential missing imports:");

        if (analysisResult.missingImports.size === 0) {
            console.log("None");
        } else {
            for (const [
                name,
                files
            ] of analysisResult.missingImports) {
                console.log(`- ${name}`);

                for (const file of files) {
                    console.log(`  used in: ${file.filePath}`);

                    for (const occurrence of file.occurrences) {
                        console.log(
                            `    line ${occurrence.line}, column ${occurrence.column}`
                        );
                    }
                }
            }
        }

        // STEP 46.3 — Collect all external imports

        const importedDependencies =
            collectImportedDependencies(fileResults);


        // Determine the project root using package.json location.
        const projectRoot = path.dirname(packageJson);

        console.log("\nStarting dependency repair...");

        const repairResult = await repairDependencies(
            importedDependencies,
            projectRoot
        );

        console.log("\nDependency repair summary:");

        console.log(
            `Success: ${repairResult.success}`
        );

        console.log(
            `Installed: ${repairResult.installed.length}`
        );

        console.log(
            `Skipped: ${repairResult.skipped.length}`
        );

        // ===================================
        // Import repair
        // ===================================

        const importRepairResult = await repairMissingImports(
            fileResults,
            projectRoot
        );

        console.log("\nDevFix repair summary:");

        console.log({
            dependenciesInstalled:
                repairResult.installed?.length ?? 0,

            filesRepaired:
                importRepairResult.repairedFiles,

            repairsProposed:
                importRepairResult.proposed,

            unresolvedImports:
                importRepairResult.unresolved,

            ambiguousImports:
                importRepairResult.ambiguous
        });
    } catch (error) {
        handleCommandError(error)
    }

}

export default fixCommands