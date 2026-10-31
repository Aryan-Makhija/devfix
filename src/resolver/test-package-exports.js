import { getPackageExports } from "./package-exports.js";

const axiosExports =
    getPackageExports("commander");

console.log("\nAxios exports:");
console.dir(axiosExports, {
    depth: null
});