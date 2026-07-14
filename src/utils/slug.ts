// slug 工具：将任意文本转换为安全的 ASCII kebab-case id
// 规则：小写、去重音、非字母数字转为连字符、压缩连字符、去首尾连字符。

/** 重音字符映射表（常见拉丁语系重音字母 → ASCII） */
const ACCENT_MAP: Record<string, string> = {
  à: 'a', á: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a', ā: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e', ē: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i', ī: 'i',
  ò: 'o', ó: 'o', ô: 'o', ö: 'o', õ: 'o', ō: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u', ū: 'u',
  ç: 'c', ñ: 'n', '’': '', "'": '', '`': '',
};

/**
 * 将文本转换为 ASCII kebab-case。
 * @param input 原始文本（可能含重音、空格、中文）
 * @returns 安全的 slug 字符串
 */
export function slugify(input: string): string {
  let s = input.trim().toLowerCase();

  // 1. 重音字母替换为 ASCII 等价字符
  s = Array.from(s)
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join('');

  // 2. 非字母数字（保留已转换的）替换为连字符
  s = s.replace(/[^a-z0-9]+/g, '-');

  // 3. 压缩并去除首尾连字符
  s = s.replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  return s;
}

/**
 * 校验 id 是否为合法的 ASCII kebab-case（仅含小写字母、数字、连字符，
 * 且不以连字符开头/结尾，不含连续连字符，不含非 ASCII 字符）。
 * @param id 待校验的 id
 * @throws 若不合法则抛出错误（含原因）
 */
export function assertSafeId(id: string): void {
  if (!id) {
    throw new Error(`非法 id：不能为空`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(
      `非法 id：「${id}」必须是小写字母/数字组成的 kebab-case，` +
        `不能含大写、空格、中文或非 ASCII 字符，且不能以连字符开头/结尾。`,
    );
  }
}
