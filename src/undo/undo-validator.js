// this file code analyze that the roleback is valid or not , that means after the the devfix command executes does user have made any changes the in the backed up file , if yes than the undo command cannot run and if not that we can run the command 





import fs from "node:fs/promises";
import path from "node:path";

import {
    calculateFileHash,
    readFileBackup
} from "./backup-manager.js";

export async function validateUndoTransaction(
    projectRoot,
    transaction
) {
    const results = {
        valid: false,
        transactionId: transaction?.id ?? null,
        files: [],
        summary: {
            safeToRestore: 0,
            alreadyOriginal: 0,
            conflicts: 0,
            invalidBackups: 0
        }
    };

    // 1. Validate transaction
    if (!transaction || transaction.status !== "completed") {
        throw new Error(
            "Only completed transactions can be undone."
        );
    }

    if (!Array.isArray(transaction.files) || !transaction.files.length) {
        throw new Error(
            "Transaction does not contain any file backups."
        );
    }

    const root = path.resolve(projectRoot);
    const seenPaths = new Set();

    // 2. Validate each file
    for (const fileRecord of transaction.files) {
        const result = {
            path: fileRecord.path,
            status: null,
            reason: null
        };

        try {
            if (
                typeof fileRecord.path !== "string" ||
                !fileRecord.path.trim() ||
                typeof fileRecord.originalHash !== "string" ||
                typeof fileRecord.repairedHash !== "string"
            ) {
                throw new Error("Invalid file record.");
            }

            // 3. Prevent duplicate or outside-project paths
            const absolutePath = path.resolve(
                root,
                fileRecord.path
            );

            const relativePath = path.relative(
                root,
                absolutePath
            );

            if (
                !relativePath ||
                relativePath === ".." ||
                relativePath.startsWith(`..${path.sep}`) ||
                path.isAbsolute(relativePath)
            ) {
                throw new Error("Invalid project file path.");
            }

            const normalizedPath = relativePath
                .split(path.sep)
                .join("/");

            if (seenPaths.has(normalizedPath)) {
                throw new Error("Duplicate file record.");
            }

            seenPaths.add(normalizedPath);

            // 4. Verify backup integrity
            await readFileBackup(
                root,
                transaction.id,
                fileRecord
            );

            // 5. Read current source file
            const currentContent = await fs.readFile(
                absolutePath,
                "utf8"
            );

            const currentHash = calculateFileHash(
                currentContent
            );

            // 6. Determine whether restoration is safe
            if (currentHash === fileRecord.repairedHash) {
                result.status = "safe_to_restore";
                results.summary.safeToRestore++;
            } else if (currentHash === fileRecord.originalHash) {
                result.status = "already_original";
                results.summary.alreadyOriginal++;
            } else {
                result.status = "conflict";
                result.reason = "File was modified after DevFix repair.";
                results.summary.conflicts++;
            }
        } catch (error) {
            if (error.code === "ENOENT") {
                result.status = "conflict";
                result.reason = "Current source file is missing.";
                results.summary.conflicts++;
            } else if (
                error.message.includes("Backup integrity check failed") ||
                error.message.includes("Invalid backup path")
            ) {
                result.status = "invalid_backup";
                result.reason = error.message;
                results.summary.invalidBackups++;
            } else {
                result.status = "conflict";
                result.reason = error.message;
                results.summary.conflicts++;
            }
        }

        results.files.push(result);
    }

    // 7. A transaction is valid only if every file is safe
    // or already in its original state.
    results.valid =
        results.summary.conflicts === 0 &&
        results.summary.invalidBackups === 0;

    return results;
}
