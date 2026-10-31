import readline from "node:readline";

export function getInstallableDependencies(
    dependencyPlan
) {
    return dependencyPlan.filter(
        (dependency) =>
            dependency.action === "install"
    );
}

export function displayDependencyPlan(
    dependencies
) {
    console.log(
        "\nDevFix found dependencies that need to be installed:\n"
    );

    for (const dependency of dependencies) {
        console.log(
            `  ${dependency.packageName}`
        );

        console.log(
            "    Used in:"
        );

        for (const location of dependency.locations) {
            console.log(
                `      ${location}`
            );
        }

        console.log();
    }

    const packageNames =
        dependencies.map(
            (dependency) =>
                dependency.packageName
        );

    console.log(
        "DevFix will run:"
    );

    console.log(
        `  npm install ${packageNames.join(" ")}`
    );
}

export async function askForDependencyConfirmation() {
    const rl =
        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

    const answer =
        await new Promise((resolve) => {
            rl.question(
                "\nDo you want to install these dependencies? (y/N) ",
                resolve
            );
        });

    rl.close();

    return (
        answer.trim().toLowerCase() === "y" ||
        answer.trim().toLowerCase() === "yes"
    );
}