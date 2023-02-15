export type Shell = "zsh" | "bash";

type SectionData = {
  group: string;
  history: string[];
  templates: { [name: string]: string[] };
};
type CurrentData = {
  sectionName: string;
  sectionGroup: string;
};
export type CommandHistory = {
  sections: { [name: string]: SectionData };
  currentData: CurrentData;
};

export interface Commands {
  list: () => void;
  start: (name: string, group: string) => void;
  finish: () => void;
  current: () => void;
  history: () => void;
  template: () => void;
}

export type CommandNames = keyof Commands;
