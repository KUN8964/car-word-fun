# 🚗 车车大联盟 · CAR CAR ADVENTURE

> 为 Anpu 打造的儿童车辆启蒙学习 App

## 简介

一款面向低龄儿童的车辆认知益智游戏。通过真实玩具车图片，帮助孩子学习颜色、车辆类别、数数等基础概念，同时融入卡牌收集机制增加趣味性。

## 功能

- **颜色找找看** — 从多辆车中找出指定颜色的车辆
- **类别游戏** — 识别赛车、巴士、工程车、摩托车等类别
- **混合游戏** — 颜色 + 类别交叉匹配，多目标寻找
- **数学游戏** — 基于收集车辆的加减法计数
- **记忆车库** — 按相同车辆、颜色或车型翻牌配对，支持 4×4、6×6、8×8
- **收藏车库** — 每连续答对 5 题获得一张卡牌，52 张可收集
- **中英双语** — 一键切换，车辆名称/提示/UI 全覆盖
- **家长控制** — 标记/锁定车辆颜色和类别，支持按颜色/类别筛选

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | TailwindCSS 3.4 |
| 图标 | lucide-react |
| 测试 | Vitest + @testing-library |
| 存储 | localStorage (v2 架构，含 v1 迁移) |
| 部署 | GitHub Pages (`gh-pages` 分支) |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 从车辆原图重新生成 320px WebP 缩略图
npm run thumbnails
```

## 项目结构

```
src/
├── CarAdventureHero.tsx   # 根组件 + 首页轮播 (241 行)
├── constants.ts           # 类型定义、i18n、配置常量
├── vehicleData.ts         # 52 辆车数据模型
├── storage.ts             # localStorage 读写
├── game/
│   ├── engine.ts          # 颜色/车型/数学游戏引擎
│   └── memory.ts          # 记忆翻牌牌组生成与配对规则
├── context/
│   └── GameContext.tsx     # 全局状态管理
├── components/
│   ├── Header.tsx         # 导航头部
│   └── RewardModal.tsx    # 卡牌奖励弹窗
├── views/
│   ├── PlayView.tsx       # 游戏界面
│   ├── MemoryView.tsx     # 记忆车库翻牌界面
│   ├── GarageView.tsx     # 收藏车库
│   └── ParentsView.tsx    # 家长控制面板
└── __tests__/             # 23 个测试用例
```

## 部署

推送到 `main` 后，GitHub Actions 会先运行测试和生产构建，通过后自动部署 `dist/`
到 GitHub Pages。仓库的 **Settings → Pages → Build and deployment** 需要选择
**GitHub Actions**。

也可在 Actions 页面手动运行 `Deploy GitHub Pages` workflow。

线上地址：https://kun8964.github.io/car-word-fun/

## License

MIT
