# DevFix – Automated Import & Dependency Repair CLI

<p align="center">
  **Detect. Resolve. Repair. Validate. Undo.**
</p>

<p align="center">
  A developer-focused Node.js CLI that automatically detects missing dependencies and unresolved imports in JavaScript and TypeScript projects, generates repair suggestions, and applies approved fixes safely.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Babel-AST-F9DC3E?logo=babel&logoColor=black" alt="Babel AST" />
  <img src="https://img.shields.io/badge/Status-V1%20Development-orange" alt="Status" />
</p>

## Overview

Developers working with JavaScript and Node.js applications frequently encounter dependency and import-related problems.

A package may be imported but not installed. A dependency may be missing from `package.json`. A component or function may be used without its corresponding import statement. In larger projects, identifying and fixing these issues across multiple files can become repetitive and time-consuming.

**DevFix is being built to automate this process.**

DevFix is a Node.js-based command-line tool that analyzes a project, identifies missing dependencies and potentially unresolved imports, determines possible resolutions, and generates code modifications.

Instead of simply displaying errors, DevFix attempts to repair them through a structured workflow involving source-code analysis, candidate resolution, repair planning, preview, developer confirmation, and validation.

The tool also maintains repair transactions and backups, allowing developers to undo supported source-code modifications and restore files to their original state.

The primary goal is to reduce repetitive debugging while keeping developers in control of every modification.

### Core philosophy

**Detect locally → Resolve intelligently → Repair deterministically → Validate → Rollback when needed**

---

## The Problem We're Solving

Consider a JavaScript project containing the following code:

```javascript
function App() {
    const [count, setCount] = useState(0);

    return (
        <button onClick={() => setCount(count + 1)}>
            {count}
        </button>
    );
}
```

The application uses `useState`, but the required import is missing.

A developer must identify the missing identifier, determine which package exports it, and add the correct import.

The same problem occurs with external dependencies.

For example:

```javascript
import express from "express";
```

If Express is not installed, the project may fail during execution or build.

### Traditional debugging workflow

1. Run the application or build command.
2. Read the error message.
3. Locate the problematic file.
4. Identify the missing dependency or import.
5. Search for the correct package or export.
6. Install the package or add the import manually.
7. Run the application again.

This process becomes increasingly repetitive when multiple issues exist across a project.

### Our approach

DevFix combines dependency analysis and source-code import repair into one automated workflow.

Rather than requiring developers to manually investigate every issue, DevFix attempts to:

- Detect missing dependencies.
- Identify potentially missing imports.
- Discover suitable package exports.
- Generate import statements.
- Preview proposed modifications.
- Apply approved changes.
- Validate the resulting source code.
- Preserve original source files for rollback.

---

## Features

### 1. Automated Dependency Detection

DevFix analyzes dependencies by comparing `package.json` with the installed packages inside `node_modules`.

It identifies different dependency states:

| Dependency state | DevFix action |
|---|---|
| Declared and installed | No action required |
| Declared but not installed | Identify for installation |
| Not declared and not installed | Identify as a missing dependency |
| Installed but not declared | Flag for developer review |

### 2. AST-Based Source Code Analysis

DevFix uses Babel parsing and AST traversal to analyze source files.

Instead of depending entirely on regular expressions, it examines the structure of the source code.

It analyzes:

- Import declarations.
- Imported identifiers.
- Identifier references.
- Potentially undefined identifiers.
- Existing bindings and imports.

This provides a structured foundation for identifying missing imports.

### 3. Intelligent Candidate Resolution

When DevFix identifies a potentially missing import, it searches available package exports to identify possible sources for the missing identifier.

For example:

```javascript
useState
```

A possible resolution is:

```text
react → useState
```

The resolver classifies candidates into three categories:

| Status | Meaning |
|---|---|
| Resolved | A suitable candidate was identified |
| Ambiguous | Multiple possible candidates were found |
| Unresolved | No suitable candidate was identified |

Ambiguous and unresolved cases are not automatically repaired.

The resolver searches existing import sources and declared dependencies, allowing it to identify exports even when the source file does not already import the relevant package.

### 4. Automated Import Generation

Once a suitable candidate is identified, DevFix generates the appropriate import declaration.

Supported import styles include:

**Named imports**

```javascript
import { useState } from "react";
```

**Default imports**

```javascript
import Component from "some-package";
```

**Namespace imports**

```javascript
import * as utilities from "some-package";
```

### 5. Import Merging and Insertion

DevFix checks existing imports before inserting new declarations.

For example:

**Before**

```javascript
import { useEffect } from "react";
```

**After**

```javascript
import { useEffect, useState } from "react";
```

When merging is unsuitable, DevFix inserts a separate import statement.

The insertion process considers source-code structure, including existing imports, comments, directives, and shebangs.

### 6. Dependency Validation and Installation

Before installing a dependency, DevFix:

- Validates the package name.
- Checks whether the package exists in the npm registry.
- Displays the installation plan.
- Requests developer confirmation.
- Executes npm installation.
- Verifies the installation result.

### 7. Repair Preview

DevFix generates a unified diff before modifying source files.

Developers can inspect the proposed changes instead of allowing the tool to silently modify their code.

### 8. Developer-Controlled Execution

Both dependency installation and source-code modification require explicit approval.

The confirmation prompt defaults to **No**, preventing accidental execution.

### 9. Safe File Modification

The repair workflow includes safeguards such as checking whether a source file has changed since preview and validating the modified source code.

Before applying source-code modifications, DevFix creates backups of the original files so that supported changes can be reversed later.

### 10. Transaction-Based Undo

DevFix now includes a transaction-based undo mechanism that allows developers to reverse completed source-code repair operations.

Every repair execution is associated with a unique transaction.

The transaction system maintains information about the repair operation, its status, and the original and repaired versions of modified files.

**Implemented functionality includes:**

- Creating a unique transaction ID for repair operations.
- Maintaining transaction history.
- Creating backups of original source files.
- Recording original and repaired SHA-256 hashes.
- Maintaining transaction manifests.
- Tracking transaction states.
- Validating transaction information before rollback.
- Checking whether files have been modified after the repair.
- Validating file paths and symlinks before restoration.
- Restoring original file contents from verified backups.
- Preventing duplicate undo operations.
- Updating transaction status after successful restoration.

#### Transaction Lifecycle

DevFix maintains transaction states to track the lifecycle of a repair operation.

| Status | Description |
|---|---|
| `pending` | Transaction has been created but is not yet completed |
| `completed` | Repair execution has completed successfully |
| `undone` | Original source files have been restored |
| `failed` | Transaction execution failed |

#### Transaction Storage

Each transaction is stored separately using a unique identifier.

Conceptually, the history structure looks like:

```text
.devfix/
└── history/
    └── <transaction-id>/
        ├── manifest.json
        └── backups/
            ├── src/
            │   └── App.jsx
            └── src/
                └── utils.js
```

The transaction manifest stores the metadata required to identify the transaction and restore the original files.

Each modified file is associated with its original and repaired SHA-256 hashes.

#### Safe Undo Mechanism

Before restoring a file, DevFix validates the transaction and verifies that the current file is in the expected repaired state.

This prevents undo from blindly overwriting subsequent developer modifications.

The undo workflow also validates backup availability, transaction status, and file paths before restoration.

Temporary restoration files are used during the undo process to support safer file replacement.

**Current scope:** Undo restores supported source-code modifications. npm dependency installation and changes to `package.json` or `package-lock.json` are not yet fully reversed by the undo mechanism.

---

## How DevFix Works

DevFix follows a modular, pipeline-based architecture.

### High-Level Repair Workflow

```mermaid
flowchart TD
    A["Developer"] --> B["DevFix CLI"]
    B --> C["Project Scanner"]
    C --> D["Source Code Analyzer"]
    D --> E["Dependency Analyzer"]
    D --> F["Import Analyzer"]
    E --> G["Dependency Repair Planner"]
    F --> H["Candidate Resolver"]
    H --> I["Import Repair Planner"]
    G --> J["Validation and Confirmation"]
    I --> J
    J --> K["Repair Preview"]
    K --> L["Developer Approval"]
    L --> M["Transaction & Backup"]
    M --> N["Repair Executor"]
    N --> O["Post-Repair Validation"]
    O --> P["Transaction History"]
```

### High-Level Undo Workflow

```mermaid
flowchart TD
    A["Developer"] --> B["devfix undo"]
    B --> C["Transaction Manager"]
    C --> D["Retrieve Transaction History"]
    D --> E["Identify Transaction"]
    E --> F["Undo Validator"]
    F --> G{"Transaction Valid?"}
    G -- No --> H["Report Validation Error"]
    G -- Yes --> I["Undo Executor"]
    I --> J["Load Backup Information"]
    J --> K["Validate File Integrity"]
    K --> L["Restore Original Files"]
    L --> M["Update Transaction Status"]
    M --> N["Mark Transaction as Undone"]
    N --> O["Undo Summary"]
```

### Step 1 – Project Scanning

DevFix identifies the project root and scans relevant source files.

It prepares the files for dependency and source-code analysis.

### Step 2 – Dependency Analysis

The dependency analyzer checks the project's package configuration and installed packages.

It determines which dependencies are already available and which require attention.

### Step 3 – Import Analysis

The source-code analyzer parses the files and extracts import declarations and identifier information.

It identifies potentially missing imports and collects external package references.

### Step 4 – Candidate Resolution

Potentially missing identifiers are passed to the candidate resolver.

The resolver searches available package exports and determines whether a suitable import source can be identified.

### Step 5 – Repair Planning

The repair planner converts analysis results into actionable operations.

It decides which dependencies should be installed and which import declarations can safely be generated, merged, or inserted.

### Step 6 – Preview and Confirmation

DevFix generates a diff preview and displays the proposed modifications.

The developer decides whether to proceed.

### Step 7 – Transaction and Backup Creation

Before supported source-code modifications are executed, DevFix creates a transaction and stores the original file contents.

The transaction manager maintains the information required for future rollback.

### Step 8 – Repair Execution

Approved dependency installations and source-code modifications are executed.

The transaction system records the execution result and updates the transaction status.

### Step 9 – Validation

DevFix validates the resulting source code and verifies dependency installation results.

### Step 10 – Undo and Recovery

When a developer wants to reverse a completed repair, they can execute:

```bash
devfix undo
```

DevFix retrieves transaction history, validates the selected transaction, verifies backup information, and restores the original source files.

After successful restoration, the transaction is marked as `undone`.

---

## Example: Automated Import Repair

Suppose a file contains:

**Before**

```javascript
import { useEffect } from "react";

function App() {
    const [count, setCount] = useState(0);

    return <div>{count}</div>;
}
```

DevFix identifies `useState` as a potentially missing import.

The candidate resolver identifies React as a possible export source.

The repair planner generates the required modification.

**Proposed change**

```diff
-import { useEffect } from "react";
+import { useEffect, useState } from "react";
```

The developer reviews the diff and approves the modification.

**After repair**

```javascript
import { useEffect, useState } from "react";

function App() {
    const [count, setCount] = useState(0);

    return <div>{count}</div>;
}
```

The modified source is then validated and its original contents are preserved in the transaction backup.

---

## Example: Transaction-Based Undo

Suppose DevFix has successfully repaired a missing import in `App.jsx`.

**Before repair**

```javascript
function App() {
    const [count, setCount] = useState(0);

    return <div>{count}</div>;
}
```

**After DevFix repair**

```javascript
import { useState } from "react";

function App() {
    const [count, setCount] = useState(0);

    return <div>{count}</div>;
}
```

DevFix stores the original contents and records the transaction information.

The developer can then execute:

```bash
devfix undo
```

The undo workflow:

1. Retrieves the previous transaction.
2. Checks whether the transaction is eligible for undo.
3. Validates the backup and file integrity.
4. Restores the original file contents.
5. Updates the transaction status to `undone`.

**After undo**

```javascript
function App() {
    const [count, setCount] = useState(0);

    return <div>{count}</div>;
}
```

The source file is restored to its original state.

---

## Terminal Demonstrations

The following sections are reserved for actual screenshots captured while running DevFix.

Replace the placeholder image paths with your screenshots.

### 1. Dependency Detection

Shows DevFix identifying missing and incorrectly installed dependencies.

![DevFix Dependency Detection](docs/screenshots/dependency-detection.png)

*Figure 1: Dependency analysis and detection output.*

### 2. Import Detection

Shows DevFix analyzing source files and identifying potentially missing imports.

![DevFix Import Detection](docs/screenshots/import-detection.png)

*Figure 2: AST-based import analysis and missing identifier detection.*

### 3. Candidate Resolution

Shows how DevFix searches package exports and classifies resolution candidates.

![DevFix Candidate Resolution](docs/screenshots/candidate-resolution.png)

*Figure 3: Candidate resolution results.*

### 4. Dependency Installation Confirmation

Shows the dependency repair plan and developer approval prompt.

![DevFix Dependency Confirmation](docs/screenshots/dependency-confirmation.png)

*Figure 4: Developer-controlled dependency installation.*

### 5. Import Repair Preview

Shows the unified diff generated before modifying source files.

![DevFix Repair Preview](docs/screenshots/import-repair-preview.png)

*Figure 5: Proposed source-code changes before execution.*

### 6. Successful Repair

Shows the final repair execution and validation output.

![DevFix Successful Repair](docs/screenshots/successful-repair.png)

*Figure 6: Successful automated repair.*

### 7. Transaction Creation and Backup

Shows DevFix creating a transaction and backing up original source files before modification.

![DevFix Transaction Backup](docs/screenshots/transaction-backup.png)

*Figure 7: Transaction creation and original file backup.*

### 8. Undo Execution

Shows the undo command validating a transaction and restoring the original source files.

![DevFix Undo Execution](docs/screenshots/undo-execution.png)

*Figure 8: Transaction-based source-code rollback.*

### 9. Successful Undo

Shows the final undo result and updated transaction status.

![DevFix Successful Undo](docs/screenshots/successful-undo.png)

*Figure 9: Successful restoration of original source files.*

---

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Primary programming language |
| Node.js | Runtime environment |
| Commander.js | CLI command management |
| Babel Parser | JavaScript/TypeScript-related source parsing |
| Babel Traverse | AST traversal and identifier analysis |
| Babel AST utilities | Structured source-code modification |
| Node.js File System APIs | Reading and modifying source files |
| Node.js Crypto | SHA-256 hashes and transaction identifiers |
| Node.js Child Process APIs | npm installation execution |
| npm Registry API | Package existence validation |
| diff | Unified repair previews |

---

## Project Architecture

DevFix follows a modular architecture where each component is responsible for a specific part of the repair pipeline.

```text
src/
│
├── analyzer/
│   ├── parser.js
│   ├── imports.js
│   ├── classify.js
│   ├── dependencies.js
│   └── analyze.js
│
├── scanner/
│   └── scanner.js
│
├── dependency/
│   ├── dependency-checker.js
│   ├── dependency-planner.js
│   ├── dependency-validator.js
│   ├── dependency-confirmation.js
│   ├── dependency-repair.js
│   ├── npm-installer.js
│   └── installation-verifier.js
│
├── resolver/
│   ├── candidate-resolver.js
│   └── package-exports.js
│
├── repair/
│   ├── import-generator.js
│   ├── import-checker.js
│   ├── repair-planner.js
│   ├── import-inserter.js
│   ├── import-merger.js
│   ├── repair-applicator.js
│   ├── repair-safety.js
│   ├── repair-preview.js
│   ├── repair-confirmation.js
│   └── file-writer.js
│
├── transaction/
│   ├── transaction-manager.js
│   ├── backup-manager.js
│   ├── undo-validator.js
│   └── undo-executor.js
│
├── commands/
│   ├── fix.js
│   ├── check.js
│   └── undo.js
│
└── cli.js
```

*Note: The directory structure above represents the major modules. Some utility and supporting files have been omitted for readability.*

### Architectural Design Principles

**Separation of concerns:** Scanning, analysis, dependency management, resolution, planning, execution, and rollback are separated into independent modules.

**Deterministic processing:** The primary repair pipeline uses explicit rules and package metadata rather than requiring an AI model for routine operations.

**Developer control:** Proposed changes are presented before execution.

**Transaction safety:** Original file contents are preserved and verified before supported rollback operations.

**Extensibility:** New analyzers, resolution strategies, and repair operations can be introduced without redesigning the complete application.

---

## Getting Started

### Prerequisites

- Node.js 20 or later.
- npm.
- A JavaScript or TypeScript project to analyze.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

```bash
cd devfix
```

### 2. Install dependencies

```bash
npm install
```

### 3. Link DevFix locally

```bash
npm link
```

This makes the `devfix` CLI command available globally in your local development environment.

### 4. Run DevFix inside a target project

Navigate to the JavaScript or TypeScript project you want to analyze.

```bash
cd path/to/your-project
```

Run the available commands:

```bash
devfix check
```

```bash
devfix fix
```

```bash
devfix undo
```

---

## CLI Commands

| Command | Description |
|---|---|
| `devfix check` | Analyze the project and report detected dependency and import issues. |
| `devfix fix` | Run the repair workflow, display proposed changes, and execute approved repairs. |
| `devfix undo` | Validate a previous repair transaction and restore the original source files. |

### Undo Safety

The undo command does not blindly restore every backup.

Before restoring files, DevFix checks transaction validity, backup availability, and file integrity.

If a file has changed unexpectedly after the repair, restoration is prevented rather than silently overwriting the developer's newer changes.

---

## Development Journey

DevFix is being developed incrementally, with each major component implemented and tested before integration.

| Phase | Implementation |
|---|---|
| 1 | CLI foundation and project scanning |
| 2 | AST-based source-code analysis |
| 3 | Dependency detection and classification |
| 4 | Package validation and installation |
| 5 | Candidate resolution and package export discovery |
| 6 | Import generation, merging, and insertion |
| 7 | Repair planning, safety checks, and validation |
| 8 | Unified diff previews and developer confirmation |
| 9 | End-to-end dependency and import repair integration |
| 10 | Transaction manager and backup system |
| 11 | Undo validator and rollback executor |
| 12 | CLI integration and end-to-end undo testing |

---

## Current Scope and Limitations

DevFix currently focuses on common dependency and import-related problems in JavaScript and TypeScript projects.

Some limitations are important to understand:

- Dynamic imports and runtime-generated references require additional analysis.
- An undefined identifier is not necessarily a missing import.
- Candidate resolution can be ambiguous when multiple packages export the same identifier.
- Package export discovery does not yet fully model every target project's module-resolution environment.
- Complex package structures may require additional resolution strategies.
- Successful syntax validation does not guarantee complete runtime correctness.
- Undo currently restores supported source-code modifications.
- Dependency installations and changes to `package.json` or `package-lock.json` are not yet fully reversed by the undo mechanism.
- Transaction backups and history are intended for supported source-file rollback, not complete environment snapshots.

These limitations define the current V1 scope and guide future development.

---

## Roadmap

### V1 – Deterministic Import and Dependency Repair

- [x] Project scanning.
- [x] Dependency state detection.
- [x] Package-name validation.
- [x] npm registry validation.
- [x] Dependency installation and verification.
- [x] AST-based import analysis.
- [x] Undefined identifier analysis.
- [x] Candidate resolution.
- [x] Named, default, and namespace import generation.
- [x] Import merging and insertion.
- [x] Repair safety checks.
- [x] Unified diff previews.
- [x] Developer confirmation.
- [x] Controlled file writing.
- [x] End-to-end repair workflow.
- [x] Transaction-based backup system.
- [x] Transaction history and manifests.
- [x] Original and repaired SHA-256 hash tracking.
- [x] Undo validation.
- [x] Safe source-file restoration.
- [x] Transaction status management.
- [x] Undo CLI integration.
- [x] End-to-end undo testing.
- [ ] Dependency installation rollback.
- [ ] Complete package manifest and lockfile rollback.
- [ ] Public V1 release.

### V2 – AI-Assisted Resolution

Potential improvements:

- Optional LLM-assisted candidate resolution.
- Better handling of ambiguous imports.
- Context-aware repair recommendations.
- Explanation of suggested modifications.
- Validation of AI-generated repair candidates.

AI will act as an optional fallback rather than replacing the deterministic repair engine.

### V3 – Advanced Developer Automation

Potential future improvements:

- Monorepo support.
- IDE integrations.
- CI/CD integration.
- Dependency compatibility analysis.
- Incremental scanning.
- Plugin-based repair rules.
- Advanced repair analytics.

---

## Evaluation and Benchmarking

DevFix is intended to be evaluated using controlled test projects containing known dependency and import-related issues.

The planned evaluation metrics include:

| Metric | What it measures |
|---|---|
| Detection precision | Correctness of detected issues |
| Detection recall | Ability to identify actual issues |
| Repair success rate | Percentage of repairs producing the expected result |
| False-repair rate | Percentage of applied repairs that are incorrect |
| Mean runtime | Average time required to complete analysis and repair |

A conventional manual/tool-assisted debugging workflow will serve as the comparison baseline.

Quantitative results should be added after controlled benchmark experiments are completed.

---

## Future Vision

The long-term vision for DevFix is to evolve from a dependency and import repair CLI into a broader developer automation tool.

The system will continue to prioritize deterministic operations and explicit validation.

An optional AI-assisted layer may be introduced for cases where conventional resolution strategies cannot confidently identify the correct solution.

The goal is not to replace developers, but to automate repetitive engineering tasks while keeping code modifications transparent, reviewable, and reversible.

---

## Contributing

Contributions, suggestions, and bug reports are welcome.

Potential areas for contribution include:

- Improving package export resolution.
- Expanding language and syntax support.
- Improving AST-based identifier analysis.
- Adding test cases for complex import structures.
- Improving repair safety and recovery.
- Supporting additional project configurations.
- Extending transaction recovery to dependency installations.

---

## Author

**Aryan Makhija**

Full-Stack Developer | Node.js | Backend Engineering | AI & RAG Systems

- GitHub: [GitHub](<YOUR_GITHUB_PROFILE_URL>)
- LinkedIn: [LinkedIn](<YOUR_LINKEDIN_PROFILE_URL>)

---

<p align="center">
  **DevFix – Making dependency and import repair simpler, safer, and more reliable.**
</p>
