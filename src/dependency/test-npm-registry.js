import {
    checkPackageExists
} from "./npm-registry.js";

const packages = [
    "axios",
    "lodash",
    "react",
    "@babel/parser",
    "abcdefg",
    "12345",
     "devfix-nonexistent-package-xyz-987654321"
];

for (const packageName of packages) {
    const result =
        await checkPackageExists(
            packageName
        );

    console.log(
        packageName,
        "→",
        result.exists
    );
}