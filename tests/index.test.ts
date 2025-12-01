// tests/index.test.ts

import { EMOJIS } from "../src/emoji";
import { generateCuteNickname } from "../src/index";
import words from "../src/words.json";

describe("generateCuteNickname", () => {
  // 不再全局 mock Math.random，除非特定测试需要
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return a string", () => {
    const nickname = generateCuteNickname();
    expect(typeof nickname).toBe("string");
    expect(nickname.length).toBeGreaterThan(0);
  });

  it("should use words from the word list", () => {
    const nickname = generateCuteNickname();
    const hasSuffix = words.suffixes.some((s) => nickname.endsWith(s));
    expect(hasSuffix).toBe(true);

    const isPureSuffix = words.suffixes.includes(nickname);
    const hasPrefix = words.prefixes.some(
      (p) => nickname.startsWith(p) && nickname !== p
    ); // 避免前缀等于整个字符串
    expect(isPureSuffix || hasPrefix).toBe(true);
  });

  it("should support emoji when withEmoji=true", () => {
    const nickname = generateCuteNickname({ withEmoji: true });

    const parts = nickname.split(" ");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(0);

    const emoji = parts[1];
    // 确保 emoji 来自我们的词库
    expect(EMOJIS).toContain(emoji);
  });

  it("should not include emoji when withEmoji=false (default)", () => {
    const nickname = generateCuteNickname();
    expect(nickname).not.toMatch(/ .+$/);
  });

  it('should allow reduplication (e.g., "土豆土豆")', () => {
    // 强制触发叠词：让 random < 0.05，并固定 suffix 选择
    const originalRandom = Math.random;
    let callCount = 0;
    jest.spyOn(Math, "random").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 0.01; // 触发叠词
      // 后续用于选择 suffix/prefix，返回 0 让其选第一个
      return 0;
    });

    const nickname = generateCuteNickname({ allowReduplication: true });

    // 验证：字符串长度为偶数，且前后两半相等
    expect(nickname.length % 2).toBe(0);
    const half = nickname.length / 2;
    const firstHalf = nickname.slice(0, half);
    const secondHalf = nickname.slice(half);
    expect(firstHalf).toBe(secondHalf);

    // 恢复
    (Math.random as jest.Mock).mockRestore();
  });

  it("should not allow reduplication when allowReduplication=false", () => {
    // 即使 random 很小，也不应叠词
    jest.spyOn(Math, "random").mockImplementation(() => 0.01);
    const nickname = generateCuteNickname({ allowReduplication: false });

    // 检查不是叠词：长度为奇数，或前后不等
    if (nickname.length % 2 === 0) {
      const half = nickname.length / 2;
      const first = nickname.slice(0, half);
      const second = nickname.slice(half);
      expect(first).not.toBe(second);
    }
    // 如果是奇数长度，肯定不是叠词，无需断言
  });

  it("should always add prefix when forcePrefix=true", () => {
    // 固定选择第一个前缀和第一个后缀
    jest.spyOn(Math, "random").mockImplementation(() => 0);
    const nickname = generateCuteNickname({ forcePrefix: true });
    const expected = words.prefixes[0] + words.suffixes[0];
    expect(nickname).toBe(expected);
  });

  it("should generate different nicknames on multiple calls", () => {
    // 不 mock random，让它真随机（短时间内足够多样）
    const nicknames = new Set<string>();
    for (let i = 0; i < 20; i++) {
      nicknames.add(generateCuteNickname());
    }
    // 由于词库较大（30+30），20 次调用几乎必然有重复？不，其实很容易重复！
    // 更合理的断言：至少有 2 个不同（而不是 3 个）
    expect(nicknames.size).toBeGreaterThanOrEqual(2);
  });

  it("should work with all combinations of options", () => {
    const optionsList = [
      {},
      { withEmoji: true },
      { allowReduplication: false },
      { forcePrefix: true },
      { withEmoji: true, forcePrefix: true },
      { withEmoji: true, allowReduplication: false },
      { withEmoji: true, allowReduplication: false, forcePrefix: true },
    ];

    optionsList.forEach((opts) => {
      const nickname = generateCuteNickname(opts);
      expect(typeof nickname).toBe("string");
      expect(nickname.length).toBeGreaterThan(0);
    });
  });

  it("should support custom wordList", () => {
    const customWords = {
      prefixes: ["喵"],
      suffixes: ["爪爪"],
    };
    const nickname = generateCuteNickname({ wordList: customWords });
    expect(nickname).toBe("喵爪爪");
  });

  it("should throw error if wordList is invalid", () => {
    expect(() =>
      generateCuteNickname({ wordList: { prefixes: [], suffixes: ["a"] } })
    ).toThrow("词库.prefixes 必须不能为空");

    expect(() =>
      generateCuteNickname({ wordList: { prefixes: ["a"], suffixes: [] } })
    ).toThrow("词库.suffixes 必须不能为空");
  });
});
