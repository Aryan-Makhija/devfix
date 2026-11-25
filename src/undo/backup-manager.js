
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import {
    getTransaction,
    updateTransactionFiles
} from "./transaction-manager.js";

// Generate SHA-256 hash
export function calculateFileHash(content) {
    return crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("hex");
}

// Generate backup directory path
function getBackupDirectory(projectRoot, transactionId) {
    return path.join(
        path.resolve(projectRoot),
        ".devfix",
        "history",
        transactionId,
        "backups"
    );
}

// Create backup of original file
export async function createFileBackup(
    projectRoot,
    transactionId,
    filePath,
    originalContent,
    repairedContent
) {
    const transaction = await getTransaction(
        projectRoot,
        transactionId
    );

    if (transaction.status !== "pending") {
        throw new Error(
            "Backups can only be added to pending transactions."
        );
    }

    const absoluteFilePath = path.resolve(
        projectRoot,
        filePath
    );

    const relativeFilePath = path.relative(
        path.resolve(projectRoot),
        absoluteFilePath
    );

    if (
        !relativeFilePath ||
        relativeFilePath === ".." ||
        relativeFilePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeFilePath)
    ) {
        throw new Error(
            "Cannot create a backup outside the project directory."
        );
    }

    const backupDirectory = getBackupDirectory(
        projectRoot,
        transactionId
    );

    await fs.mkdir(backupDirectory, {
        recursive: true
    });

    const backupId = crypto.randomUUID();
    const backupFileName = `${backupId}.bak`;

    const backupPath = path.join(
        backupDirectory,
        backupFileName
    );

    // Save original contents before modifying the source file
    await fs.writeFile(
        backupPath,
        originalContent,
        {
            encoding: "utf8",
            flag: "wx"
        }
    );

    const originalHash = calculateFileHash(
        originalContent
    );

    const repairedHash = calculateFileHash(
        repairedContent
    );

    const fileRecord = {
        path: relativeFilePath.split(path.sep).join("/"),
        backup: `backups/${backupFileName}`,
        originalHash,
        repairedHash,
        backedUpAt: new Date().toISOString()
    };

    try {
        await updateTransactionFiles(
            projectRoot,
            transactionId,
            fileRecord
        );
    } catch (error) {
        // Avoid leaving an unregistered backup
        await fs.rm(backupPath, {
            force: true
        });

        throw error;
    }

    return fileRecord;
}

// Read and verify a backup
// export async function readFileBackup(
//     projectRoot,
//     transactionId,
//     fileRecord
// ) {
//     const backupDirectory = getBackupDirectory(
//         projectRoot,
//         transactionId
//     );

//     const backupPath = path.resolve(
//         backupDirectory,
//         fileRecord.backup
//     );

//     // Ensure backup path stays inside backup directory
//     if (
//         path.relative(backupDirectory, backupPath)
//             .startsWith("..") ||
//         path.isAbsolute(
//             path.relative(backupDirectory, backupPath)
//         )
//     ) {
//         throw new Error("Invalid backup path.");
//     }

//     const content = await fs.readFile(
//         backupPath,
//         "utf8"
//     );

//     const actualHash = calculateFileHash(content);

//     if (actualHash !== fileRecord.originalHash) {
//         throw new Error(
//             `Backup integrity check failed: ${fileRecord.path}`
//         );
//     }

//     return content;
// }


// export async function readFileBackup(
//     projectRoot,
//     transactionId,
//     fileRecord
// ) {
//     const backupDirectory = getBackupDirectory(
//         projectRoot,
//         transactionId
//     );

//     const backupPath = path.resolve(
//         backupDirectory,
//         fileRecord.backup
//     );

//     console.log("READ BACKUP DEBUG:");
//     console.log("Project root:", projectRoot);
//     console.log("Transaction ID:", transactionId);
//     console.log("Backup directory:", backupDirectory);
//     console.log("File record backup:", fileRecord.backup);
//     console.log("Resolved backup path:", backupPath);

//     const exists = await fs.access(backupPath)
//         .then(() => true)
//         .catch(() => false);

//     console.log("Resolved path exists:", exists);

//     if (!exists) {
//         throw new Error(`Backup file not found: ${backupPath}`);
//     }

//     const content = await fs.readFile(backupPath, "utf8");

//     const actualHash = calculateFileHash(content);

//     if (actualHash !== fileRecord.originalHash) {
//         throw new Error(
//             `Backup integrity check failed: ${fileRecord.path}`
//         );
//     }

//     return content;
// }



export async function readFileBackup(
    projectRoot,
    transactionId,
    fileRecord
) {
    const transactionDirectory = path.join(
        path.resolve(projectRoot),
        ".devfix",
        "history",
        transactionId
    );

    const backupDirectory = getBackupDirectory(
        projectRoot,
        transactionId
    );

    // Backup path is relative to the transaction directory
    const backupPath = path.resolve(
        transactionDirectory,
        fileRecord.backup
    );

    // Ensure backup stays inside the backups directory
    const relativePath = path.relative(
        backupDirectory,
        backupPath
    );

    if (
        !relativePath ||
        relativePath === ".." ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    ) {
        throw new Error("Invalid backup path.");
    }

    const content = await fs.readFile(
        backupPath,
        "utf8"
    );

    const actualHash = calculateFileHash(content);

    if (actualHash !== fileRecord.originalHash) {
        throw new Error(
            `Backup integrity check failed: ${fileRecord.path}`
        );
    }

    return content;
}
