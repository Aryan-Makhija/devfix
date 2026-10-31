// this folder is for extracting the root directory and fetching the package.json file init it it exists



import { access, readdir } from "node:fs/promises";
import path from "node:path";

export function getCurrentDirectory() {
    return process.cwd();   // it tells us the directory from which the  devfix fix is called like C:\Projects\my-app
}

export async function findPackageJson(directory) {
    const packageJsonPath = path.join(directory, "package.json"); // finding the package.json file in the directory

    try {
        await access(packageJsonPath);   // asking node can i access this file  if it exists if yes than we will return its path 
        return packageJsonPath;
    } catch {
        return null;
    }
}



const SOURCE_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx"
];

const IGNORED_DIRECTORIES = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build"
];



// this fucntion is for extracting the files from the project that we have to analyze for dependencies issue. this function only extract the files in which dependencies are used like .js .jsx etc and ignore directory that are not required for scanning like node modules which reducess the unncessary searching. 

// This function works on the recurisive fucntion call so that we can search for the files in a directory tree like src/utils/project.js

export async function findSourceFiles(directory) {
    const entries = await readdir(directory, {  // readdir is a nodejs method that will provide the content for this directory/complete project.  withFileTypes true means that all the files
        withFileTypes: true
    });

    const files = [];  // in this we will store the files to scan form the project 

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);  //extracting the file path

        if (entry.isDirectory()) {
            if (IGNORED_DIRECTORIES.includes(entry.name)) {
                continue;
            }

            const nestedFiles = await findSourceFiles(fullPath);  // here is the recrusive call made if a valid directory is encountered in order to search for a valid file inside it to analyze for the dependency issue we agian call the function with this directory path like  we  founf component drc inside the src drc

            files.push(...nestedFiles);
        } else if (entry.isFile()) {
            const extension = path.extname(entry.name);  // extracting the file path 

            if (SOURCE_EXTENSIONS.includes(extension)) {  // checking the the file is valid or not 
                files.push(fullPath);
            }
        }
    }

    return files;
}