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
  // startPattern = /^\s*\.\/bin\/ch\.js\s+start/;
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
        sectionGroup: "",
      },
    };
    writeFileSync(this.#dataPath, JSON.stringify(data), encoding);
  }

  private update(data: CommandHistory): void {
    writeFileSync(this.#dataPath, JSON.stringify(data, null, 4), encoding);
  }

  start(name: string, group: string): void {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    data.currentData = {
      sectionName: name,
      sectionGroup: group,
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
    const { sectionName, sectionGroup } = data.currentData;
    data.sections[sectionName] = {
      group: sectionGroup,
      history: history.slice(1),
      templates: {},
    };
    data.currentData = {
      sectionName: "",
      sectionGroup: "",
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

    data.sections[sectionName].templates[templateName] = selectedLines;
    this.update(data);
  }

  async getTemplate() {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const sectionNames = Object.keys(data.sections).filter(
      (sectionName) => Object.keys(data.sections[sectionName].templates).length
    );

    const sectionName = await prompt({
      type: "select",
      name: "name",
      message: "Select sections",
      choices: sectionNames,
    }).then((answer) => {
      const { name } = answer as { name: string };
      return name;
    });

    const templateNames = Object.keys(data.sections[sectionName].templates);
    const templateName = await prompt({
      type: "select",
      name: "name",
      message: "Select templates",
      choices: templateNames,
    }).then((answer) => {
      const { name } = answer as { name: string };
      return name;
    });

    const selectedLines = data.sections[sectionName].templates[templateName];
    console.log(selectedLines.join(" && "));
  }

  current(): void {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const { sectionName, sectionGroup } = data.currentData;
    const groupString = sectionGroup ? `(${sectionGroup})` : "";
    const message =
      sectionName + groupString ? sectionName + groupString : "none";
    console.log(message);
  }

  async history() {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const sectionNames = Object.keys(data.sections);

    const sectionName = await prompt({
      type: "select",
      name: "name",
      message: "Select sections",
      choices: sectionNames,
    }).then((answer) => {
      const { name } = answer as { name: string };
      return name;
    });

    const { history } = data.sections[sectionName];
    console.log(history.join("\n"));
  }

  list(): void {
    const data = JSON.parse(readFileSync(this.#dataPath, encoding));
    const sectionNames = Object.keys(data.sections);
    sectionNames.map((sectionName) => {
      const templateNames = Object.keys(data.sections[sectionName].templates);
      const group = data.sections[sectionName].group;
      const groupString = group ? `(${group})` : "";
      console.log(`- ${sectionName}${groupString}`);
      templateNames.map((templateName) => {
        console.log(`  - ${templateName}`);
      });
    });
  }
}
