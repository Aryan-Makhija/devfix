import fs from "node:fs/promises";
import path from "node:path";

import {
    writeRepairedFile
} from "./file-writer.js";

const filePath = path.resolve(
    "devfix-writer-test/consistency.js"
);

const originalCode = "const value = useState(0);\n";

const modifiedCode =
    'import { useState } from "react";\n' +
    originalCode;

// Create original file
await fs.writeFile(
    filePath,
    originalCode
);

// Simulate developer editing the file after preview
await fs.writeFile(
    filePath,
    "const value = 100;\n"
);

// Attempt to write outdated repair
const result = await writeRepairedFile({
    filePath,
    originalCode,
    modifiedCode,
    approved: true
});

console.log(result);

const finalCode = await fs.readFile(
    filePath,
    "utf8"
);

console.log("Final file:", finalCode);