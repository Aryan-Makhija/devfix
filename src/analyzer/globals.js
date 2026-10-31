export const GLOBAL_IDENTIFIERS = new Set([
    // JavaScript built-ins
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
    "Symbol",
    "BigInt",
    "Date",
    "RegExp",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "Promise",
    "Error",
    "TypeError",
    "RangeError",
    "ReferenceError",
    "SyntaxError",
    "EvalError",
    "URIError",

    // Global functions
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",

    // Runtime globals
    "console",
    "URL",
    "URLSearchParams",
    "TextEncoder",
    "TextDecoder",
    "setTimeout",
    "setInterval",
    "setImmediate",
    "clearTimeout",
    "clearInterval",
    "clearImmediate",

    // Node.js globals
    "process",
    "Buffer",
    "global",
    "globalThis"
]);