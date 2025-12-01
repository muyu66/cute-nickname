# 🥔 cute-nickname

> 一键生成超可爱的中文昵称，比如 **小土豆**、**软布丁**、**毛茸茸团子**、**可爱猪猪**……  
> 适用于游戏、社交 App、社区用户名、节日活动等场景，萌力全开！✨

[![npm version](https://img.shields.io/npm/v/cute-nickname?color=green)](https://www.npmjs.com/package/cute-nickname)  
[![npm downloads](https://img.shields.io/npm/dm/cute-nickname)](https://www.npmjs.com/package/cute-nickname)  
[![License](https://img.shields.io/npm/l/cute-nickname)](LICENSE)

```ts
import { generateCuteNickname } from "cute-nickname";

console.log(generateCuteNickname({ withEmoji: true }));
// → 小土豆 🥔
// → 软布丁 🍮
// → 毛茸茸团子 ⚔️
```

## 📦 安装

```bash
npm install cute-nickname
```

✅ 内置 TypeScript 类型定义，无需额外配置！

---

## 🚀 快速使用

### 基础用法

```ts
import { generateCuteNickname } from "cute-nickname";

const nickname = generateCuteNickname();
console.log(nickname); // 例如："小土豆"、"云朵团子"、"魔法奶酪"
```

### 添加 Emoji

```ts
const nickname = generateCuteNickname({ withEmoji: true });
console.log(nickname); // 例如："软布丁 🍮"、"小剑客 ⚔️"
```

### 自定义词库（v1.1+）

```ts
const gameWords = {
  prefixes: ["脆皮", "野王", "超神"],
  suffixes: ["ADC", "打野", "五杀"],
};

const nickname = generateCuteNickname({
  wordList: gameWords,
  withEmoji: true,
});
// → 脆皮ADC ⚔️
```

### 所有选项

```ts
generateCuteNickname({
  withEmoji: false, // 是否附加 emoji（默认：false）
  allowReduplication: true, // 是否允许叠词，如 "土豆土豆"（默认：true）
  forcePrefix: false, // 是否强制加前缀（默认：false）
  wordList: undefined, // 自定义词库（可选）
});
```

---

## 🧩 API 说明

### generateCuteNickname(options?)

| 参数               | 类型                                       | 默认值   | 说明                                               |
| ------------------ | ------------------------------------------ | -------- | -------------------------------------------------- |
| withEmoji          | boolean                                    | false    | 在昵称末尾添加一个随机 emoji                       |
| allowReduplication | boolean                                    | true     | 允许约 5% 概率生成叠词（如 "土豆土豆"）            |
| forcePrefix        | boolean                                    | false    | 强制使用前缀（否则有 25% 概率为纯后缀，如 "布丁"） |
| wordList           | { prefixes: string[], suffixes: string[] } | 内置词库 | 自定义前缀/后缀词库                                |

💡 提示：内置词库已覆盖食物、小动物、自然、魔法、武侠、仙侠、办公室、游戏等多个可爱化领域！

---

## 🧪 示例场景

| 场景          | 代码                                            | 输出示例             |
| ------------- | ----------------------------------------------- | -------------------- |
| 社交 App 昵称 | generateCuteNickname()                          | 小蘑菇、糯糍粑       |
| 游戏角色名    | generateCuteNickname({ withEmoji: true })       | 奶辅助 ❤️、呆打野 🐾 |
| 企业内部工具  | generateCuteNickname({ wordList: officeWords }) | 摸鱼 PPT、小键盘     |

---

## 🌟 特性

✓ 开箱即用：默认词库丰富，风格统一可爱  
✓ 高度可定制：支持完全自定义词库  
✓ 类型安全：完整 TypeScript 支持  
✓ 轻量无依赖：仅 ~5KB，无第三方依赖  
✓ 支持叠词 & Emoji：增加趣味性和辨识度

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！

开发流程：

```bash
git clone https://github.com/muyu66/cute-nickname.git
cd cute-nickname
npm install
npm test          # 运行测试
npm run build     # 构建产物
```

请确保新增词汇符合“可爱风格”（柔软、无害、温暖、萌系）。

---

## 📄 许可证

MIT © zhuzhu

---

让世界多一点可爱 🌈

由 zhuzhu 倾情制作 💖
