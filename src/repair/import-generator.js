
// This stage comes after the resolver has resolved the dependencies , from the resolver result we will create the correct import statement for the dependencies  fro named , default imports  like this :->

// this is the resolver result ->
// {
//     name: "useState",
//     source: "react",
//     type: "named",
//     imported: "useState"
// }

//  this is that the repair created from it ->
// import { useState } from "react"


export function generateImportStatement(resolution) {
    const {
        source,
        type,
        imported,
        name
    } = resolution;

    if (type === "named") {
        const localName =
            name || imported;

        if (localName === imported) {
            return `import { ${imported} } from "${source}";`;
        }

        return `import { ${imported} as ${localName} } from "${source}";`;
    }

    if (type === "default") {
        const localName =
            name || source;

        return `import ${localName} from "${source}";`;
    }

    if (type === "namespace") {
        const localName =
            name || source;

        return `import * as ${localName} from "${source}";`;
    }

    throw new Error(
        `Unsupported import type: ${type}`
    );
}