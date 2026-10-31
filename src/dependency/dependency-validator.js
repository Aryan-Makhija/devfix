import { isValidPackageName } from "./package-validator.js";
import { checkPackageExists } from "./npm-registry.js";

export async function validateDependency(packageName) {
    // Step 1: Validate package name syntax
    if (!isValidPackageName(packageName)) {
        return {
            packageName,
            valid: false,
            exists: false,
            status: "invalid_name"
        };
    }

    // Step 2: Verify package in npm registry
    try {
        const result = await checkPackageExists(packageName);

        if (!result.exists) {
            return {
                packageName,
                valid: true,
                exists: false,
                status: "not_found"
            };
        }

        return {
            packageName,
            valid: true,
            exists: true,
            status: "verified"
        };

    } catch (error) {
        return {
            packageName,
            valid: true,
            exists: false,
            status: "verification_failed",
            error: error.message
        };
    }
}



export async function validateDependencies(packageNames) {
    const results = [];

    for (const packageName of packageNames) {
        const result = await validateDependency(packageName);

        results.push(result);
    }

    return {
        verified: results.filter(
            (result) => result.status === "verified"
        ),

        rejected: results.filter(
            (result) => result.status !== "verified"
        )
    };
}