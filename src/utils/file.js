import { readFile } from "node:fs/promises";

export async function readSourceFile(filePath) {
    return await readFile(filePath, "utf-8");
}