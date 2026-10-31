
// In this code we are specifying the type of import my dividing it into 3 category that is the external means npm package , local means file imported from project itself , and third is the builtin like the node packages that comes wiht the node_modules 

import { builtinModules } from "node:module";


const NODE_BUILTIN_PREFIX = "node:";

export function classifyImport(source) {
    if (source.startsWith(".") || source.startsWith("/")) {
        return "local";
    }

    if (source.startsWith(NODE_BUILTIN_PREFIX) || builtinModules.includes(source)) {
        return "builtin";
    }

    return "external";
}