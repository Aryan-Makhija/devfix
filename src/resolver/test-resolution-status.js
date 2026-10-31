function getResolutionStatus(resolutions) {
    if (resolutions.length === 0) {
        return "unresolved";
    }

    if (resolutions.length === 1) {
        return "resolved";
    }

    return "ambiguous";
}

console.log(
    "0 matches:",
    getResolutionStatus([])
);

console.log(
    "1 match:",
    getResolutionStatus([
        {
            source: "react",
            type: "named",
            imported: "useState"
        }
    ])
);

console.log(
    "2 matches:",
    getResolutionStatus([
        {
            source: "package-a",
            type: "named",
            imported: "useState"
        },
        {
            source: "package-b",
            type: "named",
            imported: "useState"
        }
    ])
);