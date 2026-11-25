import fs from "node:fs/promises";

import {
    resolveCandidates
} from "../resolver/candidate-resolver.js";

import {
    createRepairPlan
} from "./repair-planner.js";

import {
    executeImportRepairs
} from "./repair-workflow.js";

import {
    getTransaction,
    updateTransactionStatus
} from "../undo/transaction-manager.js";

export async function repairMissingImports(
    fileResults,
    projectRoot,
    transactionContext
) {
    const summary = {
        scannedFiles: 0,
        filesWithCandidates: 0,
        resolved: 0,
        ambiguous: 0,
        unresolved: 0,
        proposed: 0,
        repairedFiles: 0,
        rejectedFiles: 0,
        failedFiles: 0
    };

    console.log("\n================================");
    console.log("      IMPORT REPAIR");
    console.log("================================");

    for (const fileResult of fileResults) {
        summary.scannedFiles++;

        const {
            filePath,
            imports = [],
            importCandidates = []
        } = fileResult;

        if (!importCandidates.length) {
            continue;
        }

        summary.filesWithCandidates++;

        console.log(`\nAnalyzing: ${filePath}`);

        // 1. Resolve missing identifiers
        const resolutions = resolveCandidates(
            importCandidates,
            imports,
            projectRoot
        );

        for (const resolution of resolutions) {
            if (resolution.status === "resolved") {
                summary.resolved++;
            } else if (resolution.status === "ambiguous") {
                summary.ambiguous++;
            } else {
                summary.unresolved++;
            }
        }

        // 2. Generate repair plan
        const plan = createRepairPlan(
            resolutions,
            imports
        );

        summary.proposed += plan.repairs.length;

        if (plan.skipped.length) {
            console.log("\nSkipped candidates:");

            for (const skipped of plan.skipped) {
                console.log(
                    `- ${skipped.name}: ${skipped.reason}`
                );
            }
        }

        if (!plan.repairs.length) {
            console.log("No automatic repairs available.");
            continue;
        }

        console.log(
            `\nProposed repairs: ${plan.repairs.length}`
        );

        // 3. Read source code
        let originalCode;

        try {
            originalCode = await fs.readFile(
                filePath,
                "utf8"
            );
        } catch (error) {
            console.error(
                `Unable to read ${filePath}: ${error.message}`
            );

            summary.failedFiles++;
            continue;
        }

        // 4. Preview, confirm, and write
        try {
            const result = await executeImportRepairs(
                filePath,
                originalCode,
                plan.repairs,
                projectRoot,
                transactionContext
            );

            if (result.success) {
                summary.repairedFiles++;
            } else if (result.reason === "user_rejected") {
                summary.rejectedFiles++;
            } else if (result.reason !== "no_changes") {
                summary.failedFiles++;

                console.log(
                    `Repair skipped: ${result.reason}`
                );
            }
        } catch (error) {
            summary.failedFiles++;

            console.error(
                `Import repair failed: ${error.message}`
            );
        }
    }


    // Finalize transaction if at least one backup was created.
    if (transactionContext.transactionId) {
        const transaction = await getTransaction(
            projectRoot,
            transactionContext.transactionId
        );

        if (transaction.files.length > 0) {
            await updateTransactionStatus(
                projectRoot,
                transactionContext.transactionId,
                "completed"
            );
        }
    }

    console.log("\n================================");
    console.log("     IMPORT REPAIR SUMMARY");
    console.log("================================");

    console.table(summary);

    return summary;
}