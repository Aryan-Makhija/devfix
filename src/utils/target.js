import path from "node:path";
import { stat } from "node:fs/promises";

export async function resolveTarget(target, projectRoot) {
    if (!target) {
        return {
            type: "project",
            path: projectRoot
        };
    }
    //path.resoplve create a absolute path for the target , that starts from the root till the target li C:\\user\documents\devfix\src\fix.js
    const targetPath = path.resolve(projectRoot, target);

    try {

        //what stat does is that here stat can identify the path is a file or a directory path
        const stats = await stat(targetPath);

        if (stats.isFile()) {
            return {
                type: "file",
                path: targetPath
            };
        }

        if (stats.isDirectory()) {
            return {
                type: "directory",
                path: targetPath
            };
        }

        return {
            type: "unknown",
            path: targetPath
        };
    } catch {
        throw new Error(`Target does not exist: ${target}`);
    }
}




//In this part we are validating the path resolved by the the reslvetarget fucntion , as there is a catch that users pases the files as target like package.json ,Readme.md these files should not be scanned by out project So in ordere to validate such target we have to analyze the target path after  it is been resolved by the resolver , and only file with specific etensions are allowed to be scan further

const SOURCE_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx"
];

export function validateTarget(resolvedTarget) {
    if (resolvedTarget.type === "project") {
        return {
            valid: true
        };
    }

    if (resolvedTarget.type === "directory") {
        return {
            valid: true
        };
    }

    if (resolvedTarget.type === "file") {
        const extension = path.extname(resolvedTarget.path);

        if (!SOURCE_EXTENSIONS.includes(extension)) {
            return {
                valid: false,
                reason: `Unsupported file type: ${extension}`
            };
        }

        return {
            valid: true
        };
    }

    return {
        valid: false,
        reason: "Unsupported target type."
    };
}