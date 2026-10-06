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
  /** 预览窗口默认打开的路径。 */
  preview: string;
  /** 预览窗口可切换的 GET 路径，多于一条时显示为可点击标签。 */
  routes: string[];
  /** 应用参考答案后额外可预览的 GET 路径（通常来自 checks）。 */
  solutionRoutes: string[];
  html: string;
  /** 叠加在模板之上的课程文件。 */
  files: ProjectFiles;
  /** 练习的参考答案，叠加在课程文件之上；没有练习的课程为 null。 */
  solution: ProjectFiles | null;
}

/** 只在构建期使用的验证信息，不会打包到页面里。 */
export interface LessonChecks {
  /** 应用答案后必须命中路由的路径。 */
  paths: string[];
  /** 是否需要执行 `npm test`。 */
  test: boolean;
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
