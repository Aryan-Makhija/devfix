export function getImportedSources(imports) {
    const sources = new Set();

    for (const importInfo of imports) {
        sources.add(importInfo.source);
    }

    return [...sources];
}