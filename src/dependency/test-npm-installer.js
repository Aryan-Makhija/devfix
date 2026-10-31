import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    installDependencies
} from "./npm-installer.js";

const currentFilePath =
    fileURLToPath(import.meta.url);

const currentDir =
    path.dirname(currentFilePath);

const projectRoot =
    path.resolve(
        currentDir,
        "../.."
    );

const result =
    await installDependencies(
        ["is-number"],
        projectRoot
    );

console.log(
    "\nInstallation result:"
);

console.log(result);