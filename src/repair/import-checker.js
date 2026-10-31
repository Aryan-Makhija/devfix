export function isImportAlreadyPresent(
    imports,
    resolution
) {
    return imports.some((importInfo) => {
        if (importInfo.source !== resolution.source) {
            return false;
        }

        return importInfo.specifiers.some((specifier) => {
            if (resolution.type === "named") {
                return (
                    specifier.type === "named" &&
                    specifier.imported === resolution.imported
                );
            }

            if (resolution.type === "default") {
                return specifier.type === "default";
            }

            if (resolution.type === "namespace") {
                return specifier.type === "namespace";
            }

            return false;
        });
    });
}