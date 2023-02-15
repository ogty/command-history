import yargs from "yargs";
import { match } from "ts-pattern";
import { CommandOperator } from "./libs/operator";
import type { CommandNames } from "./types";

const args = yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")
  .command("* <command> [name] [group] [print]", "")
  .options({
    name: {
      type: "string",
      describe: "",
      demandOption: true,
      default: "",
      alias: "n",
    },
    group: {
      type: "string",
      describe: "",
      demandOption: true,
      default: "",
      alias: "g",
    },
    print: {
      type: "boolean",
      describe: "",
      demandOption: true,
      default: false,
      alias: "p",
    },
  })
  .parseSync();

const { command, name, group, print } = args;
const commandOperator = new CommandOperator();
match(command as CommandNames)
  .with("start", () => commandOperator.start(name, group))
  .with("finish", () => commandOperator.finish())
  .with("template", () => {
    if (print) {
      commandOperator.getTemplate();
      return;
    }
    commandOperator.template();
  })
  .with("history", () => commandOperator.history())
  .with("current", () => commandOperator.current())
  .with("list", () => commandOperator.list())
  .exhaustive();
