/** 教程的代码风格：装饰器（class）或函数式（function）。 */
export type Track = 'class' | 'function';

/** 教程语言。 */
export type Locale = 'zh-cn' | 'en';

/** 项目文件，key 为相对项目根目录的路径。 */
export type ProjectFiles = Record<string, string>;

/** 一节课的完整数据。 */
export interface Lesson {
  slug: string;
  title: string;
  /** 进入课程时在编辑器中打开的文件。 */
  focus: string;
  /** 预览窗口打开的路径。 */
  preview: string;
  html: string;
  /** 叠加在模板之上的课程文件。 */
  files: ProjectFiles;
}

/** 一个章节。 */
export interface Part {
  slug: string;
  title: string;
  introHtml: string;
  lessons: Lesson[];
}

/** 某个风格 + 语言下的全部课程。 */
export interface Variant {
  track: Track;
  locale: Locale;
  template: ProjectFiles;
  parts: Part[];
}

/** 只包含标题的轻量目录，用于导航。 */
export interface CatalogEntry {
  track: Track;
  locale: Locale;
  parts: Array<{
    slug: string;
    title: string;
    lessons: Array<{ slug: string; title: string }>;
  }>;
}
