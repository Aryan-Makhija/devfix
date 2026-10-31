import {
    collectImportedDependencies
} from "./imported-dependencies.js";

const fileResults = [
    {
        filePath: "src/api.js",
        imports: [
            {
                source: "axios",
                type: "external",
                packageName: "axios"
            },
            {
                source: "node:fs",
                type: "builtin",
                packageName: null
            }
        ]
    },
    {
        filePath: "src/users.js",
        imports: [
            {
                source: "axios",
                type: "external",
                packageName: "axios"
            },
            {
                source: "lodash",
                type: "external",
                packageName: "lodash"
            }
        ]
    }
];

const result =
    collectImportedDependencies(fileResults);

console.dir(result, { depth: null });