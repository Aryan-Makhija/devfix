
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
    createTransaction
} from "./transaction-manager.js";

import {
    createFileBackup,
    readFileBackup,
    calculateFileHash
} from "./backup-manager.js";

const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "devfix-backup-test-")
);

try {
    console.log("TEST 1: Create transaction");

    const transaction = await createTransaction(
        projectRoot
    );

    const originalContent = `
import { useEffect } from "react";

function App() {
    const count = 0;
    return count;
}
`;

    const repairedContent = `
import { useEffect, useState } from "react";

function App() {
    const count = useState(0);
    return count;
}
`;

    console.log("\nTEST 2: Create backup");

    const fileRecord = await createFileBackup(
        projectRoot,
        transaction.id,
        "src/App.jsx",
        originalContent,
        repairedContent
    );

    console.log(fileRecord);

    console.log("\nTEST 3: Verify original hash");

    const originalHash = calculateFileHash(
        originalContent
    );

    console.log(
        "Hash matches:",
        originalHash === fileRecord.originalHash
    );

    console.log("\nTEST 4: Read backup");
    console.log(
    "Backup path:",
    path.join(
        projectRoot,
        ".devfix",
        "history",
        transaction.id,
        fileRecord.backup
    )
);

console.log(
    "Backup exists:",
    await fs.access(
        path.join(
            projectRoot,
            ".devfix",
            "history",
            transaction.id,
            fileRecord.backup
        )
    ).then(() => true).catch(() => false)
);

    const restoredContent = await readFileBackup(
        projectRoot,
        transaction.id,
        fileRecord
    );

    console.log(
        "Original content restored:",
        restoredContent === originalContent
    );

    console.log("\nTEST 5: Verify repaired hash");

    console.log(
        "Repaired hash recorded:",
        fileRecord.repairedHash ===
            calculateFileHash(repairedContent)
    );

    console.log("\nTEST 6: Verify manifest");

    const manifest = JSON.parse(
        await fs.readFile(
            path.join(
                projectRoot,
                ".devfix",
                "history",
                transaction.id,
                "manifest.json"
            ),
            "utf8"
        )
    );

    console.log("Recorded files:", manifest.files.length);

} finally {
    await fs.rm(projectRoot, {
        recursive: true,
        force: true
    });
}
