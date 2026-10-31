
// In this function we extracting the package name such that the package name is something like this express/router  for such import source the package name is not the express/router the package name is express so we have extract that exact package name that exists in the npm registry 

export function getPackageName(source) {
    if (source.startsWith("@")) {
        const parts = source.split("/");

        return parts.slice(0, 2).join("/");
    }

    return source.split("/")[0];
}
