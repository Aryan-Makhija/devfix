
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import {
    getTransaction,
    updateTransactionStatus
} from "./transaction-manager.js";

import {
    calculateFileHash,
    readFileBackup
} from "./backup-manager.js";

import {
    validateUndoTransaction
} from "./undo-validator.js";





async function restoreFile(
    projectRoot,
    transactionId,
    fileRecord
) {
    const root = path.resolve(projectRoot);

    const absolutePath = path.resolve(
        root,
        fileRecord.path
    );

    const directory = path.dirname(absolutePath);

    let temporaryPath;

    try {
        // 1. Protect against paths escaping the project through symlinks.
        const realRoot = await fs.realpath(root);
        const realDirectory = await fs.realpath(directory);
        const relativeDirectory = path.relative(
            realRoot,
            realDirectory
        );

        if (
            relativeDirectory === ".." ||
            relativeDirectory.startsWith(`..${path.sep}`) ||
            path.isAbsolute(relativeDirectory)
        ) {
            throw new Error("Source directory is outside the project.");
        }

        const fileStats = await fs.lstat(absolutePath);

        if (!fileStats.isFile() || fileStats.isSymbolicLink()) {
            throw new Error("Source path is not a regular file.");
        }

        // 2. Recheck current content immediately before restoration.
        const currentContent = await fs.readFile(
            absolutePath,
            "utf8"
        );

        const currentHash = calculateFileHash(currentContent);

        if (currentHash === fileRecord.originalHash) {
            return {
                success: true,
                status: "already_original"
            };
        }

        if (currentHash !== fileRecord.repairedHash) {
            return {
                success: false,
                status: "conflict",
                reason: "File changed after undo validation."
            };
        }

        // 3. Read and verify the original backup.
        const originalContent = await readFileBackup(
            root,
            transactionId,
            fileRecord
        );

        const backupHash = calculateFileHash(originalContent);

        if (backupHash !== fileRecord.originalHash) {
            throw new Error("Backup hash does not match original hash.");
        }

        // 4. Create a temporary file in the same directory.
        temporaryPath = path.join(
            directory,
            `.${path.basename(absolutePath)}.${crypto.randomUUID()}.undo.tmp`
        );

        await fs.writeFile(
            temporaryPath,
            originalContent,
            {
                encoding: "utf8",
                flag: "wx",
                mode: fileStats.mode
            }
        );

        // 5. Verify temporary file before replacing the source.
        const temporaryContent = await fs.readFile(
            temporaryPath,
            "utf8"
        );

        if (
            calculateFileHash(temporaryContent) !==
            fileRecord.originalHash
        ) {
            throw new Error("Temporary restore verification failed.");
        }

        // 6. Replace the repaired file with its original content.
        await fs.rename(
            temporaryPath,
            absolutePath
        );

        temporaryPath = null;

        // 7. Verify the restored source file.
        const restoredContent = await fs.readFile(
            absolutePath,
            "utf8"
        );

        if (
            calculateFileHash(restoredContent) !==
            fileRecord.originalHash
        ) {
            throw new Error("Final restore verification failed.");
        }

        return {
            success: true,
            status: "restored"
        };

    } finally {
        if (temporaryPath) {
            await fs.rm(temporaryPath, {
                force: true
            }).catch(() => {});
        }
    }
}


export async function executeUndo(
    projectRoot,
    transactionId
) {
    // 1. Retrieve the transaction.
    const transaction = await getTransaction(
        projectRoot,
        transactionId
    );

    // 2. Validate the complete transaction before restoring anything.
    const validation = await validateUndoTransaction(
        projectRoot,
        transaction
    );

    if (!validation.valid) {
        return {
            success: false,
            reason: "validation_failed",
            validation
        };
    }

    const results = [];
    let failed = false;

    // 3. Restore files sequentially.
    for (const fileRecord of transaction.files) {
        if (failed) {
            results.push({
                path: fileRecord.path,
                status: "not_attempted"
            });

            continue;
        }

        try {
            const result = await restoreFile(
                projectRoot,
                transactionId,
                fileRecord
            );

            results.push({
                path: fileRecord.path,
                ...result
            });

            if (!result.success) {
                failed = true;
            }

        } catch (error) {
            results.push({
                path: fileRecord.path,
                status: "failed",
                reason: error.message
            });

            failed = true;
        }
    }

    // 4. Do not mark the transaction undone if restoration was incomplete.
    if (failed) {
        return {
            success: false,
            reason: "restore_failed",
            transactionId,
            files: results
        };
    }

    // 5. Mark transaction undone only after all files are verified.
    await updateTransactionStatus(
        projectRoot,
        transactionId,
        "undone"
    );

    return {
        success: true,
        reason: null,
        transactionId,
        files: results
    };
}
