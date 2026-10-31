import { getDependencyState } from "./dependency-checker.js";

export function verifyInstalledDependencies(
    packageNames,
    projectRoot
) {
    const results = [];

    for (const packageName of packageNames) {
        const state = getDependencyState(
            packageName,
            projectRoot
        );

        results.push({
            packageName,
            declared: state.declared,
            installed: state.installed,
            verified: state.declared && state.installed
        });
    }

    const successful = results.filter(
        (result) => result.verified
    );

    const failed = results.filter(
        (result) => !result.verified
    );

    return {
        success: failed.length === 0,
        total: results.length,
        successful,
        failed
    };
}


export function displayInstallationVerification(
    verification
) {
    console.log("\nDependency Installation Verification:\n");

    for (const dependency of verification.successful) {
        console.log(
            `  ✓ ${dependency.packageName} — installed`
        );
    }

    for (const dependency of verification.failed) {
        console.log(
            `  ✗ ${dependency.packageName} — not fully installed`
        );
    }

    if (verification.success) {
        console.log(
            "\nAll requested dependencies verified successfully."
        );
    } else {
        console.log(
            `\nVerification failed for ${verification.failed.length} of ${verification.total} dependencies.`
        );
    }
}