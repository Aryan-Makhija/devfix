export function findImportsByLocalName(
    imports,
    localName
) {
    const matches = [];

    for (const importInfo of imports) {
        for (const specifier of importInfo.specifiers) {
            if (specifier.local === localName) {
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