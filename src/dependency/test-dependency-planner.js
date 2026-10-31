import {
    createDependencyPlan
} from "./dependency-planner.js";

const dependencyStates = [
    {
        packageName: "axios",

        locations: [
            "src/api.js"
        ],

        declared: false,
        installed: false
    },

    {
        packageName: "lodash",

        locations: [
            "src/utils.js"
        ],

        declared: true,
        installed: false
    },

    {
        packageName: "react",

        locations: [
            "src/App.jsx"
        ],

        declared: true,
        installed: true
    },

    {
        packageName: "some-library",

        locations: [
            "src/test.js"
        ],

        declared: false,
        installed: true
    }
];

const plan =
    createDependencyPlan(
        dependencyStates
    );

console.log("\nDependency Plan:");

console.dir(plan, {
    depth: null
});