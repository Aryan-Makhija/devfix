import {
    getInstallableDependencies,
    displayDependencyPlan,
    askForDependencyConfirmation
} from "./dependency-confirmation.js";

const dependencyPlan = [
    {
        packageName: "axios",

        locations: [
            "src/api.js"
        ],

        declared: false,
        installed: false,

        action: "install",

        reason:
            "Package is neither declared nor installed."
    },

    {
        packageName: "lodash",

        locations: [
            "src/utils.js"
        ],

        declared: true,
        installed: false,

        action: "install",

        reason:
            "Package is declared but not installed."
    },

    {
        packageName: "react",

        locations: [
            "src/App.jsx"
        ],

        declared: true,
        installed: true,

        action: "none",

        reason:
            "Package is already declared and installed."
    },

    {
        packageName: "some-library",

        locations: [
            "src/test.js"
        ],

        declared: false,
        installed: true,

        action: "review",

        reason:
            "Package is installed but not declared."
    }
];

const installable =
    getInstallableDependencies(
        dependencyPlan
    );

displayDependencyPlan(
    installable
);

const confirmed =
    await askForDependencyConfirmation();

console.log(
    "\nUser confirmation:",
    confirmed
);