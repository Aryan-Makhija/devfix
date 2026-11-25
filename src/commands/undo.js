
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
    getLastCompletedTransaction
} from "../undo/transaction-manager.js";

import {
    executeUndo
} from "../undo/undo-executer.js";

import {
    findPackageJson,
    getCurrentDirectory
} from "../utils/project.js";

import {
    handleCommandError
} from "../utils/errors.js";

import path from "node:path";

// Ask the user before restoring files.
async function askForUndoConfirmation() {

    // Default to NO without an interactive terminal.
    if (!input.isTTY || !output.isTTY) {
        console.log(
            "\nInteractive confirmation unavailable. Undo cancelled."
        );

        return false;
    }

    const rl = readline.createInterface({
        input,
        output
    });

    try {
        const answer = await rl.question(
            "\nRestore these files to their original state? (y/N): "
        );

        const normalizedAnswer = answer.trim().toLowerCase();

        return (
            normalizedAnswer === "y" ||
            normalizedAnswer === "yes"
        );

    } finally {
        rl.close();
    }
}


async function undoCommand() {

    try {

        console.log("\nStarting DevFix undo...\n");

        // STEP 1: Find the current project.
        const currentDirectory = getCurrentDirectory();

        console.log(
            `Current Directory: ${currentDirectory}`
        );

        const packageJson = await findPackageJson(
            currentDirectory
        );

        if (!packageJson) {
            console.log(
                "package.json not found. No project detected."
            );

            return;
        }

        const projectRoot = path.dirname(packageJson);

        console.log(
            `Project Root: ${projectRoot}`
        );


        // STEP 2: Find the latest completed transaction.
        const transaction =
            await getLastCompletedTransaction(projectRoot);

        if (!transaction) {
            console.log(
                "\nNo completed DevFix transaction found."
            );

            console.log(
                "Run 'devfix fix' first to create a transaction."
            );

            return;
        }


        // STEP 3: Display transaction information.
        if (!transaction.files || transaction.files.length === 0) {
            console.log(
                "\nThe transaction contains no files to restore."
            );

            return;
        }

        console.log("\nLatest completed transaction found:");

        console.log(`Transaction ID: ${transaction.id}`);
        console.log(`Created At: ${transaction.createdAt}`);
        console.log(`Files to restore: ${transaction.files.length}`);

        console.log("\nFiles:");

        for (const file of transaction.files) {
            console.log(`- ${file.path}`);
        }


        // STEP 4: Ask for confirmation.
        const approved = await askForUndoConfirmation();

        if (!approved) {
            console.log("\nUndo cancelled. No files were restored.");
            return;
        }


        // STEP 5: Execute undo.
        console.log("\nRestoring original files...\n");

        const result = await executeUndo(
            projectRoot,
            transaction.id
        );


        // STEP 6: Handle validation failure.
        if (
            !result.success &&
            result.reason === "validation_failed"
        ) {
            console.log(
                "\nUndo stopped: transaction validation failed."
            );

            console.log(
                "No files were restored."
            );

            console.log("\nValidation details:");

            console.log(
                JSON.stringify(result.validation, null, 2)
            );

            return;
        }


        // STEP 7: Display restoration results.
        if (result.files) {

            for (const file of result.files) {

                if (file.status === "restored") {
                    console.log(
                        `[RESTORED] ${file.path}`
                    );

                } else if (file.status === "already_original") {
                    console.log(
                        `[SKIPPED - ALREADY ORIGINAL] ${file.path}`
                    );

                } else {
                    console.log(
                        `[${file.status.toUpperCase()}] ${file.path}`
                    );

                    if (file.reason) {
                        console.log(
                            `  Reason: ${file.reason}`
                        );
                    }
                }
            }
        }


        // STEP 8: Final summary.
        const restoredCount =
            result.files?.filter(
                file => file.status === "restored"
            ).length ?? 0;

        const alreadyOriginalCount =
            result.files?.filter(
                file => file.status === "already_original"
            ).length ?? 0;

        console.log("\nUndo Summary:");

        console.log(`Restored: ${restoredCount}`);
        console.log(`Already original: ${alreadyOriginalCount}`);

        if (result.success) {

            console.log(
                "\nUndo completed successfully!"
            );

            console.log(
                `Transaction ${transaction.id} marked as undone.`
            );

        } else {

            console.log(
                "\nUndo was incomplete."
            );

            console.log(
                "The transaction remains available for a retry."
            );
        }

    } catch (error) {

        handleCommandError(error);

    }
}

export default undoCommand;
