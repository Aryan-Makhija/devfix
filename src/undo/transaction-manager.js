// 

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const TRANSACTION_STATUS = {
    PENDING: "pending",
    COMPLETED: "completed",
    UNDONE: "undone",
    FAILED: "failed"
};

function getHistoryDirectory(projectRoot) {
    return path.join(
        path.resolve(projectRoot),
        ".devfix",
        "history"
    );
}

function getTransactionDirectory(projectRoot, transactionId) {
    return path.join(
        getHistoryDirectory(projectRoot),
        transactionId
    );
}

function getManifestPath(projectRoot, transactionId) {
    return path.join(
        getTransactionDirectory(projectRoot, transactionId),
        "manifest.json"
    );
}

// Create a new transaction
export async function createTransaction(projectRoot) {
    const transactionId = crypto.randomUUID();

    const transactionDirectory =
        getTransactionDirectory(
            projectRoot,
            transactionId
        );

    await fs.mkdir(transactionDirectory, {
        recursive: true
    });

    const transaction = {
        id: transactionId,
        command: "devfix fix",
        status: TRANSACTION_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        completedAt: null,
        undoneAt: null,
        files: []
    };

    await fs.writeFile(
        getManifestPath(projectRoot, transactionId),
        JSON.stringify(transaction, null, 2),
        {
            encoding: "utf8",
            flag: "wx"
        }
    );

    return transaction;
}

// Read transaction details
export async function getTransaction(
    projectRoot,
    transactionId
) {
    const manifestPath = getManifestPath(
        projectRoot,
        transactionId
    );

    const content = await fs.readFile(
        manifestPath,
        "utf8"
    );

    return JSON.parse(content);
}

// Update transaction status
export async function updateTransactionStatus(
    projectRoot,
    transactionId,
    status
) {
    if (
        !Object.values(TRANSACTION_STATUS)
            .includes(status)
    ) {
        throw new Error(
            `Invalid transaction status: ${status}`
        );
    }

    const transaction = await getTransaction(
        projectRoot,
        transactionId
    );

    transaction.status = status;

    if (status === TRANSACTION_STATUS.COMPLETED) {
        transaction.completedAt =
            new Date().toISOString();
    }

    if (status === TRANSACTION_STATUS.UNDONE) {
        transaction.undoneAt =
            new Date().toISOString();
    }

    await fs.writeFile(
        getManifestPath(projectRoot, transactionId),
        JSON.stringify(transaction, null, 2),
        "utf8"
    );

    return transaction;
}

// Find the most recent completed transaction
export async function getLastCompletedTransaction(
    projectRoot
) {
    const historyDirectory =
        getHistoryDirectory(projectRoot);

    let entries;

    try {
        entries = await fs.readdir(
            historyDirectory,
            {
                withFileTypes: true
            }
        );
    } catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }

        throw error;
    }

    const transactions = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }

        try {
            const transaction = await getTransaction(
                projectRoot,
                entry.name
            );

            if (
                transaction.status ===
                TRANSACTION_STATUS.COMPLETED
            ) {
                transactions.push(transaction);
            }
        } catch {
            // Ignore unreadable transaction manifests
        }
    }

    if (!transactions.length) {
        return null;
    }

    transactions.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return transactions[0];
}



export async function updateTransactionFiles(
    projectRoot,
    transactionId,
    fileRecord
) {
    const transaction = await getTransaction(
        projectRoot,
        transactionId
    );

    if (transaction.status !== "pending") {
        throw new Error(
            "Cannot modify files in a non-pending transaction."
        );
    }

    const alreadyRecorded = transaction.files.some(
        (file) => file.path === fileRecord.path
    );

    if (alreadyRecorded) {
        throw new Error(
            `File already recorded: ${fileRecord.path}`
        );
    }

    transaction.files.push(fileRecord);

    await fs.writeFile(
        getManifestPath(projectRoot, transactionId),
        JSON.stringify(transaction, null, 2),
        "utf8"
    );

    return transaction;
}
