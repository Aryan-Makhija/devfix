export function findImportsByImportedName(
    imports,
    importedName
) {
    const matches = [];

    for (const importInfo of imports) {
        for (const specifier of importInfo.specifiers) {
            if (specifier.imported === importedName) {
                matches.push({
                    source: importInfo.source,
                    packageName: importInfo.packageName,
                    type: specifier.type,
                    local: specifier.local,
                    imported: specifier.imported
                });
            }
        }
    }

    return matches;
}