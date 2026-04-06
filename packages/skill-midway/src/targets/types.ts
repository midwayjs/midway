export interface SkillContent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  rawSkillMarkdown: string;
  assetFiles: TargetFile[];
}

export interface TargetFile {
  relativePath: string;
  content: string;
}

export interface SkillTargetAdapter {
  target: string;
  getFiles(content: SkillContent): TargetFile[];
}
