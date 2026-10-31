export function createDependencyPlan(
    dependencyStates
) {
    const plan = [];

    for (const dependency of dependencyStates) {
        let action = "none";
        let reason = "";

        if (
            !dependency.declared &&
            !dependency.installed
        ) {
            action = "install";

            reason =
                "Package is neither declared nor installed.";
        } else if (
            dependency.declared &&
            !dependency.installed
        ) {
            action = "install";

            reason =
                "Package is declared but not installed.";
        } else if (
            !dependency.declared &&
            dependency.installed
        ) {
            action = "review";

            reason =
                "Package is installed but not declared.";
        } else if (
            dependency.declared &&
            dependency.installed
        ) {
            action = "none";

            reason =
                "Package is already declared and installed.";
        }

        plan.push({
            packageName:
                dependency.packageName,

            locations:
                dependency.locations,

            declared:
                dependency.declared,

            installed:
                dependency.installed,

            action,
            reason
        });
    }

    return plan;
}