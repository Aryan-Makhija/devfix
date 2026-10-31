
// what this file actually do is that it creates the import statement only for the dependency that is resolved complete, if a dependency has a status as unresolved or ambigous So for that we are not going to generate the import statement , as we have no correct proof for it . 

import {
    generateImportStatement
} from "./import-generator.js";

import {
    isImportAlreadyPresent
} from "./import-checker.js";

export function createRepairPlan(
    resolutions,
    imports
) {
    const repairs = [];
    const skipped = [];

    for (const resolution of resolutions) {
        if (resolution.status === "unresolved") {
            skipped.push({
                name: resolution.name,
                status: "unresolved",
                reason: "No resolution found"
            });

            continue;
        }

        if (resolution.status === "ambiguous") {
            skipped.push({
                name: resolution.name,
                status: "ambiguous",
                reason: "Multiple possible resolutions",
                resolutions: resolution.resolutions
            });

            continue;
        }

        if (resolution.status !== "resolved") {
            skipped.push({
                name: resolution.name,
                status: "invalid",
                reason: "Unknown resolution status"
            });

            continue;
        }

        if (resolution.resolutions.length !== 1) {
            skipped.push({
                name: resolution.name,
                status: "invalid",
                reason:
                    "Resolved candidate must have exactly one resolution"
            });

            continue;
        }

        const resolvedImport =
            resolution.resolutions[0];

        const alreadyImported =
            isImportAlreadyPresent(
                imports,
                resolvedImport
            );

        if (alreadyImported) {
            skipped.push({
                name: resolution.name,
                status: "already-imported",
                reason: "Import already exists",
                source: resolvedImport.source
            });

            continue;
        }

        const importStatement =
            generateImportStatement({
                ...resolvedImport,
                name: resolution.name
            });

        repairs.push({
            name: resolution.name,
            source: resolvedImport.source,
            type: resolvedImport.type,
            imported: resolvedImport.imported,
            importStatement
        });
    }

    return {
        repairs,
        skipped
    };
}