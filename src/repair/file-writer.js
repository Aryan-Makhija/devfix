import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { createTransaction } from "../undo/transaction-manager.js";

import {
    createFileBackup
} from "../undo/backup-manager.js";

import { parseSourceCode } from "../analyzer/parser.js";

const ALLOWED_EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx"
]);

export async function writeRepairedFile({
    filePath,
    originalCode,
    modifiedCode,
    approved,
    projectRoot,
    transactionContext
}) {
    // 1. Require explicit approval
    if (approved !== true) {
        return {
            success: false,
            reason: "not_approved"
        };
    }

    // 2. Validate arguments
    if (
        typeof filePath !== "string" ||
        typeof originalCode !== "string" ||
        typeof modifiedCode !== "string"
    ) {
        return {
            success: false,
            reason: "invalid_arguments"
        };
    }

    // 3. Restrict supported file types
    const extension = path.extname(filePath).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
        return {
            success: false,
            reason: "unsupported_file_type"
        };
    }

    // 4. Avoid unnecessary writes
    if (originalCode === modifiedCode) {
        return {
            success: false,
            reason: "no_changes"
        };
    }

    let temporaryPath;

    try {
        // 5. Read current file
        const currentCode = await fs.readFile(
            filePath,
            "utf8"
        );

        // 6. Detect modifications since preview
        if (currentCode !== originalCode) {
            return {
                success: false,
                reason: "file_changed_since_preview"
            };
        }

        // 7. Validate modified source syntax
        parseSourceCode(modifiedCode);

        // 8. Create temporary file in the same directory
        const directory = path.dirname(filePath);
        const basename = path.basename(filePath);

        temporaryPath = path.join(
            directory,
            `.${basename}.${crypto.randomUUID()}.tmp`
        );

        // Exclusive creation prevents overwriting an existing file
        await fs.writeFile(
            temporaryPath,
            modifiedCode,
            {
                encoding: "utf8",
                flag: "wx"
            }
        );

        // 9. Verify temporary file contents
        const writtenCode = await fs.readFile(
            temporaryPath,
            "utf8"
        );

        if (writtenCode !== modifiedCode) {
            throw new Error(
                "Temporary file verification failed"
            );
        }

        // Recheck immediately before creating the backup.
        const latestCode = await fs.readFile(filePath, "utf8");

        if (latestCode !== originalCode) {
            throw new Error("file_changed_before_write");
        }
        // Create one transaction for this entire fix execution.
        if (!transactionContext.transactionId) {
            const transaction = await createTransaction(projectRoot);

            transactionContext.transactionId = transaction.id;
        }

        // Back up the original file before replacing it.
        try {
            await createFileBackup(
                projectRoot,
                transactionContext.transactionId,
                filePath,
                originalCode,
                modifiedCode
            );
        } catch (error) {
            throw new Error(`Unable to create file backup: ${error.message}`);
        }

        // 10. Replace original file
        await fs.rename(
            temporaryPath,
            filePath
        );

        temporaryPath = null;

        // 11. Verify final file
        const finalCode = await fs.readFile(
            filePath,
            "utf8"
        );

        if (finalCode !== modifiedCode) {
            return {
                success: false,
                reason: "final_verification_failed"
            };
        }

        return {
            success: true,
            reason: null,
            filePath
        };

    } catch (error) {
        return {
            success: false,
            reason: error.message
        };

    } finally {
        // Remove temporary file if operation failed
        if (temporaryPath) {
            await fs.rm(temporaryPath, {
                force: true
            }).catch(() => { });
        }
    }
}