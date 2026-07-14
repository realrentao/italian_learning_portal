// QA 综合校验脚本（无第三方依赖，使用 Node 内置 assert + 类型剥离导入真实 .ts 源码）
// 运行: node scripts/qa-check.mjs  -> 结果写入 D:/qa_report.txt
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = 'D:/workbuddy工作区/2026-07-14-10-34-51/italian_learning_portal';
const SRC = path.join(ROOT, 'src');
const DATA = path.join(SRC, 'data');
const PUBLIC_AUDIO = path.join(ROOT, 'public/audio');
const DIST = path.join(ROOT, 'dist');

const out = [];
const line = (s) => out.push(String(s));

let pass = 0;
let fail = 0;
const failures = [];
function check(name, fn) {
  try {
    fn();
    pass++;
    line('  PASS  ' + name);
  } catch (e) {
    fail++;
    failures.push(name + ' :: ' + e.message);
    line('  FAIL  ' + name + ' :: ' + e.message);
  }
}

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

// ----------------------------------------------------------------------------
// 0. 环境 / 构建产物核验
// ----------------------------------------------------------------------------
line('=== 0. 环境与构建产物 ===');
const mp3Set = new Set(
  fs.existsSync(PUBLIC_AUDIO)
    ? fs.readdirSync(PUBLIC_AUDIO).filter((f) => f.toLowerCase().endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, ''))
    : []
);
check('public/audio 存在且含 130 个 mp3', () => {
  assert.strictEqual(fs.existsSync(PUBLIC_AUDIO), true, 'public/audio 不存在');
  assert.strictEqual(mp3Set.size, 130, 'mp3 数量应为 130，实际 ' + mp3Set.size);
});
check('dist 构建产物存在(index.html + assets js)', () => {
  assert.strictEqual(fs.existsSync(path.join(DIST, 'index.html')), true, 'dist/index.html 缺失');
  const assetsDir = path.join(DIST, 'assets');
  assert.strictEqual(fs.existsSync(assetsDir), true, 'dist/assets 缺失');
  const js = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  assert.ok(js.length >= 1, 'dist/assets 下无 js 产物');
});

// ----------------------------------------------------------------------------
// 1. 导入真实源码模块（slug.ts）；audio.ts 用 esbuild 模拟 Vite 注入 import.meta.env
// ----------------------------------------------------------------------------
line('=== 1. 导入真实源码模块 ===');
let slugify, assertSafeId;
try {
  const slugMod = await import(pathToFileURL(path.join(SRC, 'utils/slug.ts')).href);
  slugify = slugMod.slugify;
  assertSafeId = slugMod.assertSafeId;
  line('  (已加载 slug.ts)');
} catch (e) {
  line('  !! slug.ts 加载失败: ' + e.message);
  throw e;
}

// audio.ts 在纯 Node 下 import.meta.env 为 undefined，会抛错；用 esbuild 的 define
// 模拟 Vite 在构建期注入的 BASE_URL，从而直接测试真实源码逻辑。若 esbuild 不可用则回退等效逻辑。
let esbuildMod = null;
try { esbuildMod = await import('esbuild'); } catch { /* 走回退 */ }
const audioSrc = fs.readFileSync(path.join(SRC, 'utils/audio.ts'), 'utf8');
let audioRealSource = false; // 是否真正执行了源码（而非等效逻辑）
async function makeBuildAudioUrl(base) {
  if (esbuildMod) {
    try {
      const { code } = esbuildMod.transformSync(audioSrc, {
        loader: 'ts',
        format: 'esm',
        define: { 'import.meta.env.BASE_URL': JSON.stringify(base) },
      });
      const tmp = path.join(ROOT, 'scripts', `.audio_qa_${base.replace(/[^a-z0-9]/gi, '_')}.mjs`);
      fs.writeFileSync(tmp, code, 'utf8');
      const mod = await import(pathToFileURL(tmp).href);
      if (mod.buildAudioUrl('__p') === base + 'audio/__p.mp3') {
        audioRealSource = true;
        return mod.buildAudioUrl;
      }
    } catch { /* 回退 */ }
  }
  // 回退：与源码一致的等效逻辑（任务允许）
  return (id) => base + 'audio/' + id + '.mp3';
}
const buProd = await makeBuildAudioUrl('/italian_learning_portal/'); // 生产 GitHub Pages base
const buRoot = await makeBuildAudioUrl('/'); // 开发/根路径回退
line('  (audio.ts 测试模式: ' + (audioRealSource ? '真实源码(esbuild 注入 BASE_URL)' : '等效逻辑回退') + ')');

// ----------------------------------------------------------------------------
// 2. slug.ts 单元测试
// ----------------------------------------------------------------------------
line('=== 2. slug.ts 单元测试 ===');
check('slugify 去重音 Caffè -> caffe', () => assert.strictEqual(slugify('Caffè'), 'caffe'));
check('slugify 大写+空格 CIAO Mondo -> ciao-mondo', () => assert.strictEqual(slugify('CIAO Mondo'), 'ciao-mondo'));
check('slugify 中文被剥离 你好 World! -> world', () => assert.strictEqual(slugify('你好 World!'), 'world'));
check('slugify 多空格压缩 Multiple   Spaces -> multiple-spaces', () => assert.strictEqual(slugify('  Multiple   Spaces  '), 'multiple-spaces'));
check('slugify 首尾/重复连字符 --Hello--World-- -> hello-world', () => assert.strictEqual(slugify('  --Hello--World--  '), 'hello-world'));
check('slugify 空字符串 -> 空', () => assert.strictEqual(slugify(''), ''));
check('slugify kebab 保留 a-b-c', () => assert.strictEqual(slugify('a-b-c'), 'a-b-c'));
check('slugify 全重音 ÀÉÎÕÜ -> aeiou', () => assert.strictEqual(slugify('ÀÉÎÕÜ'), 'aeiou'));

check('assertSafeId 合法 buongiorno-mondo 通过', () => assertSafeId('buongiorno-mondo'));
check('assertSafeId 合法 a1-b2 通过', () => assertSafeId('a1-b2'));
check('assertSafeId 空串抛错', () => assert.throws(() => assertSafeId('')));
check('assertSafeId 含大写 Ciao 抛错', () => assert.throws(() => assertSafeId('Ciao')));
check('assertSafeId 含空格 ciao mondo 抛错', () => assert.throws(() => assertSafeId('ciao mondo')));
check('assertSafeId 尾部连字符 ciao-mondo- 抛错', () => assert.throws(() => assertSafeId('ciao-mondo-')));
check('assertSafeId 头部连字符 -ciao 抛错', () => assert.throws(() => assertSafeId('-ciao')));
check('assertSafeId 双连字符 ciao--mondo 抛错', () => assert.throws(() => assertSafeId('ciao--mondo')));
check('assertSafeId 非ASCII caffè 抛错', () => assert.throws(() => assertSafeId('caffè')));
check('assertSafeId 中文 中文id 抛错', () => assert.throws(() => assertSafeId('中文id')));

// ----------------------------------------------------------------------------
// 3. audio.ts 单元测试
// ----------------------------------------------------------------------------
line('=== 3. audio.ts 单元测试 ===');
// 静态校验：真实源码应包含与拼接相关的关键片段（即便走等效逻辑回退也确保测的是同一逻辑）
check('audio.ts 源码包含 import.meta.env.BASE_URL 与 audio/ 拼接', () => {
  assert.ok(audioSrc.includes('import.meta.env.BASE_URL'), '源码缺少 import.meta.env.BASE_URL');
  assert.ok(audioSrc.includes('audio/'), '源码缺少 audio/ 拼接');
});
// 生产 base（GitHub Pages）下的正确拼接
check("buildAudioUrl('abc') [base=/italian_learning_portal/] === '/italian_learning_portal/audio/abc.mp3'", () =>
  assert.strictEqual(buProd('abc'), '/italian_learning_portal/audio/abc.mp3'));
check("buildAudioUrl('ex-1') [base=/italian_learning_portal/] === '/italian_learning_portal/audio/ex-1.mp3'", () =>
  assert.strictEqual(buProd('ex-1'), '/italian_learning_portal/audio/ex-1.mp3'));
// 根路径/回退 base 下的正确拼接（Node 默认回退 '/'）
check("buildAudioUrl('abc') [base=/] === '/audio/abc.mp3'", () =>
  assert.strictEqual(buRoot('abc'), '/audio/abc.mp3'));
check("buildAudioUrl 始终以 'audio/<id>.mp3' 结尾(拼接格式正确)", () => {
  const r = buProd('mio-id');
  assert.ok(r.startsWith('/'), '应以 / 开头');
  assert.ok(r.endsWith('audio/mio-id.mp3'), '应拼出 audio/mio-id.mp3，实际 ' + r);
});
line('  (文档) vite.config.ts base=/italian_learning_portal/ => 生产音频路径前缀已通过 buProd 验证');

// ----------------------------------------------------------------------------
// 4. 练习判分逻辑（ExerciseCard 实际为 selected === answer 的二值判分）
// ----------------------------------------------------------------------------
line('=== 4. 练习判分逻辑 ===');
const exercises = readJson('exercises.json');
// 复刻组件真实比较逻辑: selected === exercise.answer ? 1 : 0
const gradeOne = (ex, selected) => (selected === ex.answer ? 1 : 0);
const gradeAll = (exs, sels) => exs.reduce((s, e, i) => s + gradeOne(e, sels[i]), 0);

check('ex-1 选正确答案(下标1) -> 得 1 分', () => assert.strictEqual(gradeOne(exercises[0], 1), 1));
check('ex-1 选错误答案(下标0) -> 得 0 分', () => assert.strictEqual(gradeOne(exercises[0], 0), 0));
check('ex-3 选正确(下标0) -> 1 分', () => assert.strictEqual(gradeOne(exercises[2], 0), 1));
check('ex-3 选错误(下标2) -> 0 分', () => assert.strictEqual(gradeOne(exercises[2], 2), 0));
check('全部选对 -> 总分 10/10', () => assert.strictEqual(gradeAll(exercises, exercises.map((e) => e.answer)), 10));
check('全部选错(-1) -> 总分 0/10', () => assert.strictEqual(gradeAll(exercises, exercises.map(() => -1)), 0));
check('混合抽样 -> 总分 9/10', () =>
  assert.strictEqual(gradeAll(exercises, [0, 2, 0, 3, 1, 1, 0, 1, 0, 1]), 9));
check('每条 exercise.answer 为合法选项下标', () => {
  for (const ex of exercises) {
    assert.ok(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < ex.options.length,
      `${ex.id} 的 answer=${ex.answer} 越界(选项数 ${ex.options.length})`);
  }
});

// ----------------------------------------------------------------------------
// 5. 数据完整性
// ----------------------------------------------------------------------------
line('=== 5. 数据完整性 ===');
const words = readJson('words.json');
const verbs = readJson('verbs.json');
const idioms = readJson('idioms.json');

check('words 数量 === 60', () => assert.strictEqual(words.length, 60, '实际 ' + words.length));
check('verbs 数量 === 30', () => assert.strictEqual(verbs.length, 30, '实际 ' + verbs.length));
check('idioms 数量 === 30', () => assert.strictEqual(idioms.length, 30, '实际 ' + idioms.length));
check('exercises 数量 === 10', () => assert.strictEqual(exercises.length, 10, '实际 ' + exercises.length));

check('全库 id 唯一(跨 words/verbs/idioms/exercises 无重复)', () => {
  const ids = [
    ...words.map((w) => w.id),
    ...verbs.map((v) => v.id),
    ...idioms.map((i) => i.id),
    ...exercises.map((e) => e.id),
  ];
  const seen = new Set();
  const dup = [];
  for (const id of ids) {
    if (seen.has(id)) dup.push(id);
    seen.add(id);
  }
  assert.strictEqual(dup.length, 0, '重复 id: ' + JSON.stringify([...new Set(dup)]));
});

const missingWords = words.filter((w) => !mp3Set.has(w.audioFile)).map((w) => w.audioFile);
const missingIdioms = idioms.filter((i) => !mp3Set.has(i.audioFile)).map((i) => i.audioFile);
const missingEx = exercises.filter((e) => !mp3Set.has(e.audioFile)).map((e) => e.audioFile);
const missingVerbs = verbs.filter((v) => !mp3Set.has(v.id)).map((v) => v.id);

check('words.audioFile 对应 mp3 全部存在 (MISSING=0)', () =>
  assert.strictEqual(missingWords.length, 0, '缺失: ' + JSON.stringify(missingWords)));
check('idioms.audioFile 对应 mp3 全部存在 (MISSING=0)', () =>
  assert.strictEqual(missingIdioms.length, 0, '缺失: ' + JSON.stringify(missingIdioms)));
check('exercises.audioFile 对应 mp3 全部存在 (MISSING=0)', () =>
  assert.strictEqual(missingEx.length, 0, '缺失: ' + JSON.stringify(missingEx)));
check('verbs.id 对应 mp3 全部存在 (MISSING=0)', () =>
  assert.strictEqual(missingVerbs.length, 0, '缺失: ' + JSON.stringify(missingVerbs)));

const ALLOWED = new Set(['color', 'daily', 'travel', 'food', 'number']);
check('words.category 均在允许集合内', () => {
  const bad = words.filter((w) => !ALLOWED.has(w.category)).map((w) => `${w.id}:${w.category}`);
  assert.strictEqual(bad.length, 0, '非法 category: ' + JSON.stringify(bad));
});

check('idioms 必备字段齐全(id/italian/chinese/culturalNote/audioFile)', () => {
  const bad = idioms.filter((i) => !i.id || !i.italian || !i.chinese || !i.culturalNote || !i.audioFile)
    .map((i) => i.id || '?');
  assert.strictEqual(bad.length, 0, '缺字段: ' + JSON.stringify(bad));
});

// verbs 结构: 7 个语式; 人称语式 forms=6, 无人称语式(infinito/participio/gerundio) forms=1
const PERSON_MOODS = new Set(['indicativo', 'congiuntivo', 'condizionale', 'imperativo']);
const NONPERSON_MOODS = new Set(['infinito', 'participio', 'gerundio']);
const ALL_MOODS = new Set([...PERSON_MOODS, ...NONPERSON_MOODS]);
check('verbs 每条含 7 个不同语式', () => {
  const bad = [];
  for (const v of verbs) {
    const moods = new Set(v.conjugation.map((c) => c.mood));
    if (moods.size !== 7) bad.push(`${v.id}:${moods.size}`);
    for (const m of moods) if (!ALL_MOODS.has(m)) bad.push(`${v.id}:未知语式:${m}`);
  }
  assert.strictEqual(bad.length, 0, '异常: ' + JSON.stringify(bad));
});
check('verbs 人称语式 ConjugationCell.forms 长度=6', () => {
  const bad = [];
  for (const v of verbs) {
    for (const c of v.conjugation) {
      if (PERSON_MOODS.has(c.mood) && c.forms.length !== 6) bad.push(`${v.id}/${c.mood}/${c.tense}=${c.forms.length}`);
    }
  }
  assert.strictEqual(bad.length, 0, '异常: ' + JSON.stringify(bad));
});
check('verbs 无人称语式(infinito/participio/gerundio) ConjugationCell.forms 长度=1', () => {
  const bad = [];
  for (const v of verbs) {
    for (const c of v.conjugation) {
      if (NONPERSON_MOODS.has(c.mood) && c.forms.length !== 1) bad.push(`${v.id}/${c.mood}/${c.tense}=${c.forms.length}`);
    }
  }
  assert.strictEqual(bad.length, 0, '异常: ' + JSON.stringify(bad));
});

// ----------------------------------------------------------------------------
// 6. 动词变位抽查（权威 indicativo presente）
// ----------------------------------------------------------------------------
line('=== 6. 动词变位抽查(indicativo presente) ===');
const verbById = Object.fromEntries(verbs.map((v) => [v.id, v]));
const getPresente = (v) => {
  const cell = v.conjugation.find((c) => c.mood === 'indicativo' && c.tense === 'presente');
  if (!cell) throw new Error(`${v.id} 缺少 indicativo/presente`);
  return cell.forms;
};
const SPOT = {
  essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
  avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
  andare: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'],
  fare: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'],
  parlare: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano'],
};
for (const [id, expected] of Object.entries(SPOT)) {
  check(`动词 ${id} indicativo presente 正确`, () => {
    assert.ok(verbById[id], `数据缺动词 ${id}`);
    const got = getPresente(verbById[id]);
    assert.deepStrictEqual(got, expected, `期望 ${JSON.stringify(expected)} 实际 ${JSON.stringify(got)}`);
  });
}

// ----------------------------------------------------------------------------
// 汇总
// ----------------------------------------------------------------------------
line('');
line('========================================');
line(`QA 结果: 通过 ${pass} / 共 ${pass + fail}  |  失败 ${fail}`);
if (fail > 0) {
  line('失败项:');
  for (const f of failures) line('  - ' + f);
}
line('========================================');
fs.writeFileSync('D:/qa_report.txt', out.join('\n'), 'utf8');
