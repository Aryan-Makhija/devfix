import path from "node:path";

import {
    getPackageExports
} from "./package-exports.js";

const projectRoot = path.resolve(
    "devfix-test-project"
);

const result = getPackageExports(
    "react",
    projectRoot
);

console.log("\nPackage found:", result.found);

console.log(
    "useState exported:",
    result.exports.includes("useState")
);

console.log(
    "useEffect exported:",
    result.exports.includes("useEffect")
);

console.log(
    "Default export:",
    result.hasDefault
);