import path from "node:path";

import { findSourceFiles } from "../utils/project.js";

export async function scanTarget(target) {
    if (target.type === "file") {
        return [target.path];
    }

    if (
        target.type === "project" ||
        target.type === "directory"
    ) {
        return await findSourceFiles(target.path);
    }

    throw new Error(
        `Cannot scan unsupported target type: ${target.type}`
    );
}