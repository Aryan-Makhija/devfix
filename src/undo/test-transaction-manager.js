import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
    createTransaction,
    getTransaction,
    updateTransactionStatus,
    getLastCompletedTransaction
} from "./transaction-manager.js";

// Use a disposable directory instead of a real project
const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "devfix-undo-test-")
);

console.log("Test project:", projectRoot);

try {
    // TEST 1: Create transaction
    console.log("\nTEST 1: Create transaction");

    const transaction = await createTransaction(
        projectRoot
    );

    console.log("Transaction ID:", transaction.id);
    console.log("Status:", transaction.status);

    // TEST 2: Read transaction
    console.log("\nTEST 2: Read transaction");

    const storedTransaction = await getTransaction(
        projectRoot,
        transaction.id
    );

    console.log(storedTransaction);

    // TEST 3: Complete transaction
    console.log("\nTEST 3: Complete transaction");

    const completedTransaction =
        await updateTransactionStatus(
            projectRoot,
            transaction.id,
            "completed"
        );

    console.log(
        "Status:",
        completedTransaction.status
    );

    // TEST 4: Find latest completed transaction
    console.log("\nTEST 4: Find latest transaction");

    const latestTransaction =
        await getLastCompletedTransaction(
            projectRoot
        );

    console.log(
        "Latest transaction:",
        latestTransaction?.id
    );

    // TEST 5: Mark transaction undone
    console.log("\nTEST 5: Mark transaction undone");

    const undoneTransaction =
        await updateTransactionStatus(
            projectRoot,
            transaction.id,
            "undone"
        );

    console.log(
        "Status:",
        undoneTransaction.status
    );

    // TEST 6: Verify undone transaction is excluded
    console.log("\nTEST 6: Check undo eligibility");

    const remainingTransaction =
        await getLastCompletedTransaction(
            projectRoot
        );

    console.log(
        "Remaining completed transaction:",
        remainingTransaction
    );

} finally {
    // Remove disposable test project
    await fs.rm(projectRoot, {
        recursive: true,
        force: true
    });
}