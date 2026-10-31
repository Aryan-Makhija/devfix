import {
    isValidPackageName,
    validatePackageNames
} from "./package-validator.js";

const testPackages = [
    "axios",
    "lodash",
    "react-dom",
    "@babel/parser",
    "@scope/package",

    "axios && malicious-command",
    "axios; malicious-command",
    "axios | malicious-command",
    "npm install axios",
    "../something",
    "shinchan"
];

console.log("\nPackage validation:");

for (const packageName of testPackages) {
    console.log(
        `${JSON.stringify(packageName)} →`,
        isValidPackageName(packageName)
    );
}

console.log(
    "\nValidation summary:"
);

console.dir(
    validatePackageNames(
        testPackages
    ),
    {
        depth: null
    }
);