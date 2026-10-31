// In this file we are recongnising that which are the  files that are imported but missing from the package.json in this file with the category named as external is compared

export function findMissingDependencies(
    imports,
    declaredDependencies
) {
    const missing = new Set();

    for (const importInfo of imports) {
        if (importInfo.type !== "external") {
            continue;
        }

        if (!Object.hasOwn(declaredDependencies, importInfo.packageName)) {
            missing.add(importInfo.packageName);
        }
    }

    return [...missing];
}