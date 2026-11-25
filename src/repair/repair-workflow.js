import { applyImportRepairs } from "./repair-applicator.js";
import { writeRepairedFile } from "./file-writer.js";
import {
    generateRepairPreview,
    displayRepairPreview
} from "./repair-preview.js";

import {
    askForRepairConfirmation
} from "./repair-confirmation.js";

export async function prepareImportRepairs(
    filePath,
    originalCode,
    repairs,
    projectRoot,
    transactionContext
) {
    // Step 1: Generate modified code in memory
    const repairResult = applyImportRepairs(
        originalCode,
        repairs
    );

    // Step 2: Generate diff preview
    const preview = generateRepairPreview(
        filePath,
        originalCode,
        repairResult.code
    );

    // Step 3: No changes required
    if (!preview.changed) {
        console.log(
            `\nNo import repairs required for ${filePath}`
        );

        return {
            approved: false,
            changed: false,
            originalCode,
            modifiedCode: originalCode,
            applied: repairResult.applied,
            skipped: repairResult.skipped
        };
    }

    // Step 4: Display proposed modifications
    displayRepairPreview(preview);

    console.log("\nImport repair summary:");
    console.log(`Applied: ${repairResult.applied.length}`);
    console.log(`Skipped: ${repairResult.skipped.length}`);

    // Step 5: Ask for user approval
    const approved = await askForRepairConfirmation();

    return {
        approved,
        changed: true,
        originalCode,
        modifiedCode: repairResult.code,
        applied: repairResult.applied,
        skipped: repairResult.skipped
    };
}


// export async function executeImportRepairs(
//     filePath,
//     originalCode,
//     repairs
// ) {
//     // 1. Generate preview and ask confirmation
//     const preparation = await prepareImportRepairs(
//         filePath,
//         originalCode,
//         repairs
//     );

//     // 2. Do not write without approval
//     if (!preparation.approved) {
//         return {
//             success: false,
//             reason: preparation.changed
//                 ? "user_rejected"
//                 : "no_changes"
//         };
//     }

//     // 3. Write approved changes
//     const writeResult = await writeRepairedFile({
//         filePath,
//         originalCode: preparation.originalCode,
//         modifiedCode: preparation.modifiedCode,
//         approved: preparation.approved,
//         projectRoot,
//         transactionContext
//     });

//     if (writeResult.success) {
//         console.log(
//             `\nSuccessfully repaired: ${filePath}`
//         );
//     } else {
//         console.log(
//             `\nFailed to repair ${filePath}: ${writeResult.reason}`
//         );
//     }

//     return writeResult;
// }


export async function executeImportRepairs(
    filePath,
    originalCode,
    repairs,
    projectRoot,
    transactionContext
) {
    // 1. Generate preview and ask confirmation
    const preparation = await prepareImportRepairs(
        filePath,
        originalCode,
        repairs
    );

    // 2. Do not write without approval
    if (!preparation.approved) {
        return {
            success: false,
            reason: preparation.changed
                ? "user_rejected"
                : "no_changes"
        };
    }

    // 3. Write approved changes
    const writeResult = await writeRepairedFile({
        filePath,
        originalCode: preparation.originalCode,
        modifiedCode: preparation.modifiedCode,
        approved: preparation.approved,
        projectRoot,
        transactionContext
    });

    if (writeResult.success) {
        console.log(
            `\nSuccessfully repaired: ${filePath}`
        );
    } else {
        console.log(
            `\nFailed to repair ${filePath}: ${writeResult.reason}`
        );
    }

    return writeResult;
}
