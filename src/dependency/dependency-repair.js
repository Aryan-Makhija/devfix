 // This is the main file for the dependecy repoar ClI , as tit combines all the dependcy repairs files at one place . 


import { analyzeDependencyStates } from "./dependency-checker.js";
import { createDependencyPlan } from "./dependency-planner.js";

import {
    validateDependencies
} from "./dependency-validator.js";

import {
    getInstallableDependencies,
    displayDependencyPlan,
    askForDependencyConfirmation
} from "./dependency-confirmation.js";

import { installDependencies } from "./npm-installer.js";

import {
    verifyInstalledDependencies,
    displayInstallationVerification
} from "./installation-verifier.js";

export async function repairDependencies(
    missingDependencies,
    projectRoot
) {
    // 1. Analyze dependency states
    const states = analyzeDependencyStates(
        missingDependencies,
        projectRoot
    );

    // 2. Create dependency plan
    const plan = createDependencyPlan(states);

    // 3. Get packages requiring installation
    const installable = getInstallableDependencies(plan);

    if (installable.length === 0) {
        console.log("\nNo dependencies require installation.");

        return {
            success: true,
            installed: [],
            skipped: []
        };
    }

    // 4. Validate package names and registry existence
    const packageNames = installable.map(
        (dependency) => dependency.packageName
    );

    const validation = await validateDependencies(packageNames);

    // 5. Display rejected packages
    for (const dependency of validation.rejected) {
        console.log(
            `\nSkipped ${dependency.packageName}: ${dependency.status}`
        );
    }

    // 6. Only verified packages can proceed
    const verifiedNames = new Set(
        validation.verified.map(
            (dependency) => dependency.packageName
        )
    );

    const verifiedDependencies = installable.filter(
        (dependency) => verifiedNames.has(dependency.packageName)
    );

    if (verifiedDependencies.length === 0) {
        console.log("\nNo verified dependencies available for installation.");

        return {
            success: false,
            installed: [],
            skipped: installable
        };
    }

    // 7. Display installation plan
    displayDependencyPlan(verifiedDependencies);

    // 8. Ask for confirmation
    const confirmed = await askForDependencyConfirmation();

    if (!confirmed) {
        console.log("\nDependency installation cancelled.");

        return {
            success: false,
            installed: [],
            skipped: verifiedDependencies
        };
    }

    // 9. Execute installation
    const namesToInstall = verifiedDependencies.map(
        (dependency) => dependency.packageName
    );

    const installation = await installDependencies(
        namesToInstall,
        projectRoot
    );

    // 10. Verify installed packages
    const verification = verifyInstalledDependencies(
        namesToInstall,
        projectRoot
    );

    displayInstallationVerification(verification);

    return {
        success:
            installation.success &&
            verification.success &&
            validation.rejected.length === 0,

        installed: verification.successful,
        skipped: [
            ...validation.rejected,
            ...verification.failed
        ]
    };
}