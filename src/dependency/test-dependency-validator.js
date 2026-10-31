import {
    validateDependency,
    validateDependencies
} from "./dependency-validator.js";

const packages = [
    "axios",
    "@babel/parser",
    "devfix-nonexistent-package-xyz-987654321",
    "axios && malicious-command"
];

console.log("\nTesting individual validation:\n");

for (const packageName of packages) {
    const result = await validateDependency(packageName);

    console.log(result);
}

console.log("\nTesting batch validation:\n");

const result = await validateDependencies(packages);

console.dir(result, { depth: null });