import fs from "node:fs";
import path from "node:path";

function readPackageJson(projectRoot) {
    const packageJsonPath =
        path.join(
            projectRoot,
            "package.json"
        );

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error(
            "package.json not found"
        );
    }

    return JSON.parse(
        fs.readFileSync(
            packageJsonPath,
            "utf-8"
        )
    );
}

function getDeclaredDependencies(packageJson) {
    return {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
    };
}

export function isPackageInstalled(
    packageName,
    projectRoot
) {
    const packagePath =
        path.join(
            projectRoot,
            "node_modules",
            packageName,
            "package.json"
        );

    return fs.existsSync(packagePath);
}

export function getDependencyState(
    packageName,
    projectRoot
) {
    const packageJson =
        readPackageJson(projectRoot);

    const declaredDependencies =
        getDeclaredDependencies(
            packageJson
        );

    const declared =
        Object.prototype.hasOwnProperty.call(
            declaredDependencies,
            packageName
        );

    const installed =
        isPackageInstalled(
            packageName,
            projectRoot
        );

    return {
        packageName,
        declared,
        installed
    };
}


export function analyzeDependencyStates(
    missingDependencies,
    projectRoot
) {
    return missingDependencies.map(
        (dependency) => {
            const state =
                getDependencyState(
                    dependency.packageName,
                    projectRoot
                );

            return {
                packageName:
                    dependency.packageName,

                locations:
                    dependency.locations,

                declared:
                    state.declared,

                installed:
                    state.installed
            };
        }
    );
}