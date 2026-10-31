// In this we are also checking the package is declared in the package.json but not found in node modules that package also need to be installed . 

export function collectImportedDependencies(fileResults) {
    const dependencies = new Map();

    for (const file of fileResults) {
        for (const importInfo of file.imports) {

            if (importInfo.type !== "external") {
                continue;
            }

            const packageName = importInfo.packageName;

            if (!packageName) {
                continue;
            }

            if (!dependencies.has(packageName)) {
                dependencies.set(packageName, new Set());
            }

            dependencies.get(packageName).add(file.filePath);
        }
    }

    return Array.from(
        dependencies,
        ([packageName, locations]) => ({
            packageName,
            locations: Array.from(locations)
        })
    );
}