#!/usr/bin/env node


import { Command } from "commander";

import fixCommand from "./commands/fix.js";
import checkCommand from "./commands/check.js";
import undoCommand from "./commands/undo.js";





const program = new Command();  // used commander here so that we donot have to manually create the if else statements for each command /. Also commander is a cli node js tool that help to handle the cli commands it also provide real cli commands like --help --version 

program
    .name("devfix")
    .description("Automated Import and Dependency Repair CLI")
    .version("1.0.0")

program
    .command("fix [target]")
    .description("Scan and repair Import and dependency issues")
    .action(fixCommand)

program
    .command("check")
    .description("Analyze the project wihtout modifying files")
    .action(checkCommand)

program
    .command("undo")
    .description("Undo the latest completed DevFix repair transaction")
    .action(undoCommand);



program.parse();    