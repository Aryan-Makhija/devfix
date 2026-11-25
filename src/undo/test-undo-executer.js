
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
    createTransaction,
    updateTransactionStatus,
    getTransaction
} from "./transaction-manager.js";

import {
    createFileBackup
} from "./backup-manager.js";

import {
    executeUndo
} from "./undo-executer.js";


const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "devfix-undo-executor-")
);


async function createTestTransaction(files) {
    const transaction = await createTransaction(projectRoot);

    for (const file of files) {
        const filePath = path.join(
            projectRoot,
            file.path
        );

        await fs.mkdir(path.dirname(filePath), {
            recursive: true
        });

        await fs.writeFile(
            filePath,
            file.original,
            "utf8"
        );

        await createFileBackup(
            projectRoot,
            transaction.id,
            file.path,
            file.original,
            file.repaired
        );

        // Simulate the file after DevFix repair.
        await fs.writeFile(
            filePath,
            file.current ?? file.repaired,
            "utf8"
        );
    }

    await updateTransactionStatus(
        projectRoot,
        transaction.id,
        "completed"
    );

    return transaction.id;
}


try {
    // TEST 1: Restore a repaired file.
    console.log("\nTEST 1: Restore original file");

    const transactionId1 = await createTestTransaction([
        {
            path: "src/App.jsx",
            original: `const message = "Original";`,
            repaired: `const message = "Repaired";`
        }
    ]);

    const result1 = await executeUndo(
        projectRoot,
        transactionId1
    );

    const restoredFile = await fs.readFile(
        path.join(projectRoot, "src/App.jsx"),
        "utf8"
    );

    const transaction1 = await getTransaction(
        projectRoot,
        transactionId1
    );

    console.log(result1);
    console.assert(result1.success, "Undo should succeed.");
    console.assert(
        restoredFile === `const message = "Original";`,
        "Original content should be restored."
    );
    console.assert(
        transaction1.status === "undone",
        "Transaction should be marked undone."
    );


    // TEST 2: File is already original.
    console.log("\nTEST 2: Already original");

    const transactionId2 = await createTestTransaction([
        {
            path: "src/AlreadyOriginal.jsx",
            original: `const value = "Original";`,
            repaired: `const value = "Repaired";`,
            current: `const value = "Original";`
        }
    ]);

    const result2 = await executeUndo(
        projectRoot,
        transactionId2
    );

    console.log(result2);

    console.assert(
        result2.success,
        "Already-original file should not prevent undo."
    );

    console.assert(
        result2.files[0].status === "already_original",
        "Expected already_original."
    );


    // TEST 3: Conflict prevents the entire transaction.
    console.log("\nTEST 3: Conflict prevents restoration");

    const transactionId3 = await createTestTransaction([
        {
            path: "src/First.jsx",
            original: `const first = "Original";`,
            repaired: `const first = "Repaired";`
        },
        {
            path: "src/Second.jsx",
            original: `const second = "Original";`,
            repaired: `const second = "Repaired";`,
            current: `const second = "Changed by user";`
        }
    ]);

    const result3 = await executeUndo(
        projectRoot,
        transactionId3
    );

    const firstFile = await fs.readFile(
        path.join(projectRoot, "src/First.jsx"),
        "utf8"
    );

    const secondFile = await fs.readFile(
        path.join(projectRoot, "src/Second.jsx"),
        "utf8"
    );

    console.log(result3);

    console.assert(
        !result3.success,
        "Undo should fail when a conflict exists."
    );

    console.assert(
        firstFile === `const first = "Repaired";`,
        "First file must remain untouched."
    );

    console.assert(
        secondFile === `const second = "Changed by user";`,
        "User changes must remain untouched."
    );

    console.log("\nUndo executor tests completed.");

} finally {
    await fs.rm(projectRoot, {
        recursive: true,
        force: true
    });
}
