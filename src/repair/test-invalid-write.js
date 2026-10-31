import fs from "node:fs/promises";
import path from "node:path";

import {
    writeRepairedFile
} from "./file-writer.js";

const filePath = path.resolve(
    "devfix-writer-test/invalid.js"
);

const originalCode = "const value = 10;\n";

await fs.writeFile(
    filePath,
    originalCode
);

const result = await writeRepairedFile({
    filePath,
    originalCode,
    modifiedCode: "const value = ;",
    approved: true
});

console.log(result);

const finalCode = await fs.readFile(
    filePath,
    "utf8"
);

console.log("Final file:", finalCode);