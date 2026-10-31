// thjs file basically create s list that say what are the candidates( a missing import) , their occurances and the imports that file contians form where this candidate is fetched , it does not conclude anything . This is the actual work of the resolver layer . 

import {
    getPackageExports
} from "./package-exports.js";

export function resolveCandidates(
    candidates,
    imports,
    projectRoot
) {
    const existingSources = [
        ...new Set(
            imports.map(
                (importInfo) => importInfo.source
            )
        )
    ];

    return candidates.map((candidate) => {
        const resolutions = [];

        for (const source of existingSources) {
            const packageInfo =
                getPackageExports(
                    source,
                    projectRoot
                );

            if (!packageInfo.found) {
                continue;
            }

            if (
                packageInfo.exports.includes(
                    candidate.name
                )
            ) {
                resolutions.push({
                    source,
                    type: "named",
                    imported: candidate.name
                });
            }

            if (
                packageInfo.hasDefault &&
                candidate.name === source
            ) {
                resolutions.push({
                    source,
                    type: "default",
                    imported: null
                });
            }
        }

        let status = "unresolved";

        if (resolutions.length === 1) {
            status = "resolved";
        } else if (resolutions.length > 1) {
            status = "ambiguous";
        }

        return {
            name: candidate.name,
            occurrences: candidate.occurrences,
            status,
            resolutions
        };
    });
}