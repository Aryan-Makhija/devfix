// In this file we are identifying the imports like this 

// import React from "react"
// ↓
// default

// import { useState } from "react"
//         ↓
// named

// import * as React from "react"
//         ↓
// namespace

export function classifySpecifier(specifier) {
    if (specifier.type === "ImportDefaultSpecifier") {
        return "default";
    }

    if (specifier.type === "ImportSpecifier") {
        return "named";
    }

    if (specifier.type === "ImportNamespaceSpecifier") {
        return "namespace";
    }

    return "unknown";
}