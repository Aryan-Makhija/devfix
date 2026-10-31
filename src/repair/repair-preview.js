import { createTwoFilesPatch } from "diff";

export function generateRepairPreview(
    filePath,
    originalCode,
    modifiedCode
) {
    if (originalCode === modifiedCode) {
        return {
            filePath,
            changed: false,
            patch: ""
        };
    }

    const patch = createTwoFilesPatch(
        filePath,
        filePath,
        originalCode,
        modifiedCode,
        "Original",
        "Modified",
        {
            context: 3
        }
    );

    return {
        filePath,
        changed: true,
        patch
    };
}

export function displayRepairPreview(preview) {
    if (!preview.changed) {
        console.log(
            `\nNo changes required: ${preview.filePath}`
        );

        return;
    }

    console.log(
        `\nProposed changes: ${preview.filePath}\n`
    );

    console.log(preview.patch);
}