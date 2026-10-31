// import {
//     spawn
// } from "node:child_process";

// export function installDependencies(
//     packageNames,
//     projectRoot
// ) {
//     return new Promise((resolve, reject) => {
//         if (packageNames.length === 0) {
//             resolve({
//                 success: true,
//                 code: 0
//             });

//             return;
//         }

//         const npmCommand =
//             process.platform === "win32"
//                 ? "npm.cmd"
//                 : "npm";

//         const npmArgs = [
//             "install",
//             ...packageNames
//         ];

//         console.log(
//             `\nRunning: ${npmCommand} ${npmArgs.join(" ")}\n`
//         );

//         const child =
//             spawn(
//                 npmCommand,
//                 npmArgs,
//                 {
//                     cwd: projectRoot,
//                     stdio: "inherit"
//                 }
//             );

//         child.on(
//             "error",
//             (error) => {
//                 reject(error);
//             }
//         );

//         child.on(
//             "close",
//             (code) => {
//                 resolve({
//                     success: code === 0,
//                     code
//                 });
//             }
//         );
//     });
// }
import {
    execFile
} from "node:child_process";

export function installDependencies(
    packageNames,
    projectRoot
) {
    return new Promise((resolve, reject) => {
        if (packageNames.length === 0) {
            resolve({
                success: true,
                code: 0
            });

            return;
        }

        const isWindows =
            process.platform === "win32";

        const command =
            isWindows
                ? process.env.ComSpec
                : "npm";

        const args =
            isWindows
                ? [
                    "/d",
                    "/c",
                    "npm",
                    "install",
                    ...packageNames
                ]
                : [
                    "install",
                    ...packageNames
                ];

        console.log(
            `\nInstalling dependencies:\n`
        );

        console.log(
            packageNames
                .map(
                    (packageName) =>
                        `  - ${packageName}`
                )
                .join("\n")
        );

        const child =
            execFile(
                command,
                args,
                {
                    cwd: projectRoot
                },
                (error, stdout, stderr) => {
                    if (stdout) {
                        process.stdout.write(
                            stdout
                        );
                    }

                    if (stderr) {
                        process.stderr.write(
                            stderr
                        );
                    }

                    if (error) {
                        resolve({
                            success: false,
                            code:
                                typeof error.code ===
                                "number"
                                    ? error.code
                                    : 1
                        });

                        return;
                    }

                    resolve({
                        success: true,
                        code: 0
                    });
                }
            );
    });
}