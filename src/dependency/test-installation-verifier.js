import path from "node:path";

import {
    verifyInstalledDependencies,
    displayInstallationVerification
} from "./installation-verifier.js";

const projectRoot = process.cwd();

const packageNames = [
    "is-number"
];

const result = verifyInstalledDependencies(
    packageNames,
    projectRoot
);

displayInstallationVerification(result);