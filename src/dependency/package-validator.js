const PACKAGE_NAME_PATTERN =
    /^(?:@(?:[a-z0-9-._~]+\/)?[a-z0-9-._~]+|[a-z0-9-._~]+)$/i;

export function isValidPackageName(
    packageName
) {
    if (
        typeof packageName !== "string"
    ) {
        return false;
    }

    const trimmed =
        packageName.trim();

    if (trimmed.length === 0) {
        return false;
    }

    return PACKAGE_NAME_PATTERN.test(
        trimmed
    );
}

export function validatePackageNames(
    packageNames
) {
    const invalid = [];

    for (const packageName of packageNames) {
        if (
            !isValidPackageName(
                packageName
            )
        ) {
            invalid.push(packageName);
        }
    }

    return {
        valid: invalid.length === 0,
        invalid
    };
}