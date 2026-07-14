// 音频路径工具
// 运行时基于 Vite 的 BASE_URL（对应 GitHub Pages 子路径 /italian_learning_portal/）
// 拼接出音频文件的完整 URL。音频文件名与数据 id 一致，扩展名为 .mp3。

/**
 * 根据音频 id 拼接音频文件的完整访问 URL。
 * @param id 数据条目中的 audioFile（即文件主名，不含扩展名）
 * @returns 形如 `${BASE_URL}audio/${id}.mp3` 的绝对（相对站点根）URL
 */
export function buildAudioUrl(id: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}audio/${id}.mp3`;
}
