import {
    isImportAlreadyPresent
} from "./import-checker.js";

const imports = [
    {
        source: "react",
        specifiers: [
            {
                type: "named",
                local: "useState",
                imported: "useState"
            },
            {
                type: "named",
                local: "effect",
                imported: "useEffect"
            }
        ]
    },

    {
        source: "axios",
        specifiers: [
            {
                type: "default",
                local: "axios",
                imported: null
            }
        ]
    }
];

const useStateResolution = {
    source: "react",
    type: "named",
    imported: "useState"
};

const useMemoResolution = {
    source: "react",
    type: "named",
    imported: "useMemo"
};

const axiosResolution = {
    source: "axios",
    type: "default",
    imported: null
};
const useEffectResolution = {
    source: "react",
    type: "named",
    imported: "useEffect"
};

console.log(
    "useEffect:",
    isImportAlreadyPresent(
        imports,
        useEffectResolution
    )
);

console.log(
    "useState:",
    isImportAlreadyPresent(
        imports,
        useStateResolution
    )
);

console.log(
    "useMemo:",
    isImportAlreadyPresent(
        imports,
        useMemoResolution
    )
);

console.log(
    "axios:",
    isImportAlreadyPresent(
        imports,
        axiosResolution
    )
);