export async function checkPackageExists(
    packageName
) {
    const encodedPackageName =
        encodeURIComponent(packageName);

    const registryUrl =
        `https://registry.npmjs.org/${encodedPackageName}`;

    const response =
        await fetch(registryUrl);

    if (response.status === 200) {
        return {
            exists: true,
            packageName
        };
    }

    if (response.status === 404) {
        return {
            exists: false,
            packageName
        };
    }

    throw new Error(
        `npm registry request failed for "${packageName}" with status ${response.status}`
    );
}