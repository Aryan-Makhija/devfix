
// In this file we are reading the packaage.json file to indentify what are external dependencies that project already contains 
import { readFile } from "node:fs/promises";

export async function readPackageJson(packageJsonPath) {

    const content = await readFile(packageJsonPath, "utf-8")
    return JSON.parse(content);

}

// this fucntion is to create the dependencies inventory 
export function getDeclaredDependencies(packageJson) {
    return {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
}