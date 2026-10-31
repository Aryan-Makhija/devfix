import {
    createRepairPlan
} from "./repair-planner.js";

const resolutions = [
    {
        name: "useState",
        status: "resolved",
        resolutions: [
            {
                source: "react",
                type: "named",
                imported: "useState"
            }
        ]
    },

    {
        name: "calculateSomething",
        status: "unresolved",
        resolutions: []
    },

    {
        name: "foo",
        status: "ambiguous",
        resolutions: [
            {
                source: "package-a",
                type: "named",
                imported: "foo"
            },
            {
                source: "package-b",
                type: "named",
                imported: "foo"
            }
        ]
    }
];

const plan =
    createRepairPlan(resolutions);

console.log("\nRepair plan:");

console.dir(plan, {
    depth: null
});