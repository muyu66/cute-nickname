import { EMOJIS } from "./emoji";
import defaultWords from "./words.json";

/**
 * 昵称生成选项
 */
export interface NicknameOptions {
  /**
   * 是否附加随机 emoji
   * @default false
   */
  withEmoji?: boolean;

  /**
   * 是否允许叠词（如“土豆土豆”）
   * @default false
   */
  allowReduplication?: boolean;

  /**
   * 是否强制添加前缀（如“小”“软”）
   * @default false
   */
  forcePrefix?: boolean;
  /**
   * 自定义词库，格式：{ prefixes: string[], suffixes: string[] }
   */
  wordList?: WordList;
}

/**
 * 词库格式
 */
export interface WordList {
  prefixes: string[];
  suffixes: string[];
}

/**
 * 生成一个可爱的中文昵称（如“小土豆”、“软布丁”）
 * @param options 生成选项
 * @returns 生成的昵称字符串
 *
 * @example
 * ```ts
 * generateCuteNickname(); // "小土豆"
 * generateCuteNickname({ withEmoji: true }); // "软布丁 🍮"
 * ```
 */
export function generateCuteNickname(options: NicknameOptions = {}): string {
  const {
    withEmoji = false,
    allowReduplication = false,
    forcePrefix = false,
    wordList = defaultWords, // ← 使用自定义词库或默认
  } = options;

  const { prefixes, suffixes } = wordList;

  // 安全检查：确保词库有效
  if (!Array.isArray(prefixes) || prefixes.length === 0) {
    throw new Error("词库.prefixes 必须不能为空");
  }
  if (!Array.isArray(suffixes) || suffixes.length === 0) {
    throw new Error("词库.suffixes 必须不能为空");
  }

  // 随机选择主体词
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // 叠词逻辑（约 5% 概率）
  if (allowReduplication && Math.random() < 0.05) {
    let name = suffix + suffix;
    if (withEmoji) {
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      name += " " + emoji;
    }
    return name;
  }

  // 决定是否加前缀
  const usePrefix = forcePrefix || Math.random() > 0.25; // 75% 概率加前缀
  const name = usePrefix
    ? prefixes[Math.floor(Math.random() * prefixes.length)] + suffix
    : suffix;

  // 添加 emoji
  if (withEmoji) {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    return `${name} ${emoji}`;
  }

  return name;
}
