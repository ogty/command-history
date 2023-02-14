import yargs from "yargs";
import { match } from "ts-pattern";
import { CommandOperator } from "./libs/operator";
import type { CommandNames } from "./types";

const args = yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")
  .command("* <command> [name] [group]", "")
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
  })
  .parseSync();

const { command, name, group } = args;
const commandOperator = new CommandOperator();
match(command as CommandNames)
  .with("start", () => commandOperator.start(name, group))
  .with("finish", () => commandOperator.finish())
  .with("template", () => commandOperator.template())
  .with("list", () => commandOperator.list())
  .exhaustive();
