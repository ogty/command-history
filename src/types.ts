export type Shell = "zsh" | "bash";

type Template = { [name: string]: string[] };
type SectionData = {
  history: string[];
  category: string;
  templates: Template[];
};
type CurrentData = {
  sectionName: string;
  sectionCategory: string;
};
export type CommandHistory = {
  sections: { [name: string]: SectionData };
  currentData: CurrentData;
};

export interface Commands {
  list: () => void;
  start: (name: string, category: string) => void;
  finish: () => void;
  template: () => void;
}

export type CommandNames = keyof Commands;
