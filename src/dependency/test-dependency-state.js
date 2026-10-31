import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    getDependencyState,
    analyzeDependencyStates
} from "./dependency-checker.js";

const currentFilePath =
    fileURLToPath(import.meta.url);

const currentDir =
    path.dirname(currentFilePath);

const projectRoot =
    path.resolve(
        currentDir,
        "../.."
    );

console.log("\nDependency states:");

console.log(
    "axios:",
    getDependencyState(
        "axios",
        projectRoot
    )
);

console.log(
    "react:",
    getDependencyState(
        "react",
        projectRoot
    )
);

const missingDependencies = [
    {
        packageName: "axios",
        locations: [
            "src/analyzer/test-imports.js"
        ]
    },

    {
        packageName: "some-library",
        locations: [
            "src/analyzer/parser.js",
            "src/analyzer/test-imports.js"
        ]
    }
];

console.log(
    "\nAnalyzed dependency states:"
);

console.dir(
    analyzeDependencyStates(
        missingDependencies,
        projectRoot
    ),
    {
        depth: null
    }
);