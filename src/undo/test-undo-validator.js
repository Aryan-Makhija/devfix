
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
    createTransaction,
    updateTransactionStatus
} from "./transaction-manager.js";

import {
    createFileBackup
} from "./backup-manager.js";

import {
    validateUndoTransaction
} from "./undo-validator.js";

const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "devfix-undo-test-")
);

try {
    const sourceDirectory = path.join(projectRoot, "src");

    await fs.mkdir(sourceDirectory, { recursive: true });

    const filePath = path.join(sourceDirectory, "App.jsx");

    const originalCode = `const message = "Original";`;
    const repairedCode = `import React from "react";\nconst message = "Repaired";`;

    // TEST SETUP: Create original source file
    await fs.writeFile(filePath, originalCode, "utf8");

    // Create transaction
    const transaction = await createTransaction(projectRoot);

    // Create backup
    const fileRecord = await createFileBackup(
        projectRoot,
        transaction.id,
        "src/App.jsx",
        originalCode,
        repairedCode
    );

    // Simulate DevFix repairing the source file
    await fs.writeFile(filePath, repairedCode, "utf8");

    await updateTransactionStatus(
        projectRoot,
        transaction.id,
        "completed"
    );

    const completedTransaction = {
        ...transaction,
        status: "completed",
        files: [fileRecord]
    };

    // TEST 1: Current file still has repaired content
    console.log("\nTEST 1: Safe restoration");

    const safeResult = await validateUndoTransaction(
        projectRoot,
        completedTransaction
    );

    console.log(safeResult.files);
    console.assert(
        safeResult.files[0].status === "safe_to_restore",
        "Expected safe_to_restore"
    );

    // TEST 2: File is already original
    console.log("\nTEST 2: Already original");

    await fs.writeFile(filePath, originalCode, "utf8");

    const originalResult = await validateUndoTransaction(
        projectRoot,
        completedTransaction
    );

    console.log(originalResult.files);
    console.assert(
        originalResult.files[0].status === "already_original",
        "Expected already_original"
    );

    // TEST 3: User independently modified the file
    console.log("\nTEST 3: User modification conflict");

    await fs.writeFile(
        filePath,
        `const message = "User changed this";`,
        "utf8"
    );

    const conflictResult = await validateUndoTransaction(
        projectRoot,
        completedTransaction
    );

    console.log(conflictResult.files);
    console.assert(
        conflictResult.files[0].status === "conflict",
        "Expected conflict"
    );

    // TEST 4: Backup integrity
    console.log("\nTEST 4: Backup integrity");

    const backupPath = path.join(
        projectRoot,
        ".devfix",
        "history",
        transaction.id,
        fileRecord.backup
    );

    await fs.writeFile(backupPath, "tampered backup", "utf8");

    const backupResult = await validateUndoTransaction(
        projectRoot,
        completedTransaction
    );

    console.log(backupResult.files);
    console.assert(
        backupResult.files[0].status === "invalid_backup",
        "Expected invalid_backup"
    );

    console.log("\nUndo validator tests completed.");

} finally {
    await fs.rm(projectRoot, {
        recursive: true,
        force: true
    });
}
