 // this file ask user by showing the preview to add these changes in the source code or not .

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function askForRepairConfirmation() {
    // Default to NO when running without an interactive terminal
    if (!input.isTTY || !output.isTTY) {
        console.log(
            "\nInteractive confirmation unavailable. Repair cancelled."
        );

        return false;
    }

    const rl = readline.createInterface({
        input,
        output
    });

    try {
        const answer = await rl.question(
            "\nApply the proposed import repairs? (y/N): "
        );

        const normalizedAnswer = answer.trim().toLowerCase();

        return (
            normalizedAnswer === "y" ||
            normalizedAnswer === "yes"
        );
    } finally {
        rl.close();
    }
}