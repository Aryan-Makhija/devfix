import path from "node:path";

import {
    resolveCandidates
} from "./candidate-resolver.js";

const projectRoot = path.resolve(
    "devfix-test-project"
);

const candidates = [
    {
        name: "useState",
        occurrences: []
    },
    {
        name: "useEffect",
        occurrences: []
    },
    {
        name: "nonExistingHook",
        occurrences: []
    }
];

const imports = [
    {
        source: "react"
    }
];

const results = resolveCandidates(
    candidates,
    imports,
    projectRoot
);

console.dir(results, {
    depth: null
});