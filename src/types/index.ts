// 全局类型定义
// 所有 id / slug 均为 ASCII kebab-case（小写、连字符、去重音），禁止中文或空格。

/** 词汇分类 */
export type WordCategory = 'color' | 'daily' | 'travel' | 'food' | 'number';

/** 语式（动词变位的 7 大语式） */
export type Mood =
  | 'infinito'
  | 'indicativo'
  | 'congiuntivo'
  | 'condizionale'
  | 'imperativo'
  | 'participio'
  | 'gerundio';

/** 单词条目 */
export interface Word {
  /** ASCII kebab-case 唯一标识，同时作为音频文件名（不含扩展名） */
  id: string;
  /** 意大利语单词 */
  italian: string;
  /** 中文释义 */
  chinese: string;
  /** 分类 */
  category: WordCategory;
  /** 音频文件名（仅存 id，运行时由组件拼 BASE_URL，如 `${BASE_URL}audio/${id}.mp3`） */
  audioFile: string;
  /** 例句（意大利语） */
  example?: string;
  /** 例句中文翻译 */
  exampleZh?: string;
}

/** 变位单元格：某一语式某一时态的 6 个人称形式 */
export interface ConjugationCell {
  /** 语式 */
  mood: Mood;
  /** 时态名称（如 presente, imperfetto） */
  tense: string;
  /**
   * 6 个人称形式，顺序固定为：
   * [io, tu, lui/lei, noi, voi, loro]
   * 无人称语式（infinito/participio/gerundio）仅含 1 个元素。
   */
  forms: string[];
}

/** 动词条目 */
export interface Verb {
  /** ASCII kebab-case 唯一标识，同时作为音频文件名 */
  id: string;
  /** 动词原形（意大利语） */
  infinitive: string;
  /** 中文释义 */
  chinese: string;
  /** 完整变位表 */
  conjugation: ConjugationCell[];
}

/** 练习选项 */
export interface ExerciseOption {
  id: string;
  text: string;
}

/** 听力选择题 */
export interface Exercise {
  id: string;
  type: 'listening-choice';
  /** 题干（通常提示用户听音频并选择） */
  prompt: string;
  /** 音频文件名（id） */
  audioFile: string;
  options: ExerciseOption[];
  /** 正确答案在 options 中的下标 */
  answer: number;
  /** 解析说明 */
  explanation?: string;
}

/** 习语条目 */
export interface Idiom {
  id: string;
  /** 意大利语习语 */
  italian: string;
  /** 中文释义 */
  chinese: string;
  /** 字面意思（可选） */
  literal?: string;
  /** 文化注释 */
  culturalNote: string;
  /** 音频文件名（id） */
  audioFile: string;
  /** 分类（可选） */
  category?: string;
}
