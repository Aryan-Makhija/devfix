
// in this file we are checking the requested source package in the node modules , in that we check we check whether the source package actually exprorts  the depndency we want . this helps us to clarify  that  the imports which file already have also exports the the dependency that is used but not improted. 

// import { createRequire } from "node:module";


// const require = createRequire(import.meta.url);

// const packageExportCache = new Map();  // this line is creating the cache of export of sources we have checked . in order to  reduce the calling export check for same source again and again for each dependency  , with the help of it we can check the  new dependency existance in a particular package export whose exports are already called . 

// export function getPackageExports(packageName) {


//     if (packageExportCache.has(packageName)) {  // checking in the cache for a the package before calling the fucnytion
//         return packageExportCache.get(packageName);
//     }

//     try {
//         const packageModule = require(packageName);

//         const result = {
//             found: true,
//             exports: Object.keys(packageModule),
//             hasDefault: "default" in packageModule
//         };

//         packageExportCache.set(
//             packageName,
//             result
//         );

//         return result;
//     } catch (error) {
//         const result = {
//             found: false,
//             exports: [],
//             hasDefault: false
//         };

//         packageExportCache.set(
//             packageName,
//             result
//         );

//         return result;
//     }
// }


import { createRequire } from "node:module";
import path from "node:path";

const packageExportCache = new Map();

export function getPackageExports(
    packageName,
    projectRoot
) {
    const absoluteProjectRoot = path.resolve(projectRoot);

    const cacheKey =
        `${absoluteProjectRoot}::${packageName}`;

    // Check cache
    if (packageExportCache.has(cacheKey)) {
        return packageExportCache.get(cacheKey);
    }

    try {
        // Resolve packages relative to target project
        const projectRequire = createRequire(
            path.join(
                absoluteProjectRoot,
                "package.json"
            )
        );

        // Resolve package entry point first
        const resolvedPath = projectRequire.resolve(
            packageName
        );

        // Load package exports
        const packageModule = projectRequire(
            resolvedPath
        );

        const result = {
            found: true,
            exports: Object.keys(packageModule),
            hasDefault: "default" in packageModule
        };

        packageExportCache.set(
            cacheKey,
            result
        );

        return result;

    } catch (error) {
        const result = {
            found: false,
            exports: [],
            hasDefault: false
        };

        packageExportCache.set(
            cacheKey,
            result
        );

        return result;
    }
}