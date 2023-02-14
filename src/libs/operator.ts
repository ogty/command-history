import { match } from "ts-pattern";
import { prompt } from "enquirer";
import type { CommandHistory, Shell, Commands } from "../types";
import { readFileSync, writeFileSync, existsSync } from "fs";

const encoding = "utf-8";

export class CommandHistoryOperator {
  #home = process.env.HOME;
  #shell = process.env.SHELL?.split("/").pop();
  protected historyFilePath = "";
  public commandHistoryFilePath = `${this.#home}/.command_history.json`;

  constructor() {
    if (!this.#shell) {
      throw new Error("shell is not found");
    }
    this.setHistoryFilePath();
  }

  private setHistoryFilePath(): void {
    const historyFilePath = match(this.#shell as Shell)
      .with("zsh", () => `${this.#home}/.zsh_history`)
      .with("bash", () => `${this.#home}/.bash_history`)
      .exhaustive();
    this.historyFilePath = historyFilePath;
  }

  public getHistoryContent(): string {
    return String(readFileSync(this.historyFilePath, encoding));
  }
}

export class CommandOperator implements Commands {
  #dataPath: string;
  #commandHistoryOperator: CommandHistoryOperator;
  historyLinePattern = /: (?<timestamp>[0-9]+):[0-9]+;(?<command>.*)/;
  startPattern = /^\s*ch\s+start/;

  constructor() {
    this.#commandHistoryOperator = new CommandHistoryOperator();
    this.#dataPath = this.#commandHistoryOperator.commandHistoryFilePath;
    this.init();
  }

  private init(): void {
    if (existsSync(this.#dataPath)) return;

    const data: CommandHistory = {
      sections: {},
      currentData: {
        sectionName: "",
        sectionCategory: "",
      },
    };
    writeFileSync(this.#dataPath, JSON.stringify(data), encoding);
  }

  private update(data: CommandHistory): void {
    writeFileSync(this.#dataPath, JSON.stringify(data, null, 4), encoding);
  }

  start(name: string, category: string): void {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    data.currentData = {
      sectionName: name,
      sectionCategory: category,
    };
    this.update(data);
  }

  finish(): void {
    const allHistory = this.#commandHistoryOperator.getHistoryContent();
    const historyLines = allHistory.split("\n").reverse();

    const history: string[] = [];
    let isStart = false;
    historyLines.map((line) => {
      if (isStart) return;

      const match = line.match(this.historyLinePattern);
      if (match?.groups) {
        const { command } = match.groups;
        if (this.startPattern.test(command)) {
          isStart = true;
          return;
        }
        history.push(command);
      }
    });

    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const { sectionName, sectionCategory } = data.currentData;
    data.sections[sectionName] = {
      history: history.slice(1),
      category: sectionCategory,
      templates: [],
    };
    data.currentData = {
      sectionName: "",
      sectionCategory: "",
    };
    this.update(data);
  }

  async template(): Promise<void> {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const sectionNames = Object.keys(data.sections);

    // sectionName
    const sectionName = await prompt({
      type: "select",
      name: "name",
      message: "Select sections",
      choices: sectionNames,
    }).then((answer) => {
      const { name } = answer as { name: string };
      return name;
    });

    // selectedLines
    const section = data.sections[sectionName];
    const { history } = section;
    const clonedHistory = history.slice();
    const selectedLines = await prompt({
      type: "multiselect",
      name: "selectedCommands",
      message: "Select commands",
      choices: clonedHistory,
    }).then((answer) => {
      const { selectedCommands } = answer as { selectedCommands: string[] };
      return selectedCommands;
    });

    // templateName
    const templateName = await prompt({
      type: "input",
      name: "name",
      message: "Input template name",
    }).then((answer) => {
      const { name } = answer as { name: string };
      return name;
    });

    data.sections[sectionName].templates.push({
      [templateName]: selectedLines,
    });
    this.update(data);
  }

  list(): void {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const sectionNames = Object.keys(data.sections);
    sectionNames.map((sectionName) => {
      console.log(`- ${sectionName}`);
    });
  }
}
