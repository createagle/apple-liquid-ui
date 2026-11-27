# Apple Liquid UI — Agent 工作指南

本文档为后续接手或协作开发的 AI Agent 提供项目背景、架构约定、避坑规范、标准改造流程与剩余目标。修改文档站或组件前请先完整阅读以下约定。

---

## 1. 项目定位与目标

**Apple Liquid UI** 是一个基于 **shadcn/ui（`base-nova` / `@base-ui/react`）+ Tailwind CSS v4 + Motion（`motion/react`）+ `@liqui-design/glass`** 构建的 **Apple macOS 27 & iOS 27 Liquid Glass 风格响应式组件库**。

### 核心目标
1. **将全部 shadcn/ui 基础组件升级为 Apple Liquid Glass 风格**：
   - 目前 `components/ui/` 中已通过 shadcn CLI 安装了完整的 63+ 个基础组件，需要将它们逐步按 **Apple macOS 27 UI Kit**（桌面端）与 **Apple iOS 27 UI Kit**（移动端）的尺寸、材质、交互与动效规范完成重构。
   - 官方设计稿本地存放路径（已加入 `.gitignore`，不提交至 Git；可直接用 Python `zipfile` + `json` 解析内部图层色值/圆角/模糊/间距）：
     - `sketch/Apple macOS 27 UI Kit.sketch`
     - `sketch/Apple iOS 27 UI Kit.sketch`
     - 若本地 `sketch/` 目录不存在或为空，请前往苹果官方设计资源页下载对应的 macOS / iOS Sketch UI Kit 并放入 `sketch/` 目录：https://developer.apple.com/design/resources/
2. **原生视口响应式跨端形态切换**：
   - 桌面端（`>= 768px`）遵循 macOS 27 交互与密度，移动端（`< 768px`）自动切换 iOS 27 触控人体工学或交互形态（例如 `Select` 在桌面端为悬浮下拉菜单，移动端自动切换为可下滑关闭的浮动 `Drawer` 列表）。
3. **全局 Liquid Glass 通透度可配置（透明 Clear ↔ 色调 Tinted）**：
   - 提供可独立安装复用的 `LiquidGlassProvider`、`useLiquidGlass()` 与 `LiquidGlassTintSlider`，让外部项目接入后也能像 Apple 系统设置一样实时调节全站玻璃通透度。
4. **纯静态文档站与 Shadcn Registry 分发**：
   - 文档站基于 Next.js 16 + Fumadocs 16（`output: 'export'` 纯静态导出，零后端依赖），内置静态多语言/中文全文搜索与 shadcn 风格的 `Preview / Code` + 桌面/平板/手机真实视口切换预览器。
   - 所有组件通过 `scripts/sync-registry.mjs` 自动同步并打包为 `public/r/<name>.json`（静态导出到 `out/r/<name>.json`），支持外部项目通过 `npx shadcn@latest add @apple-liquid/<component>` 一键安装。

---

## 2. 必须遵守的架构与设计约束（避坑必读）

### 2.1 纯视口响应式（严禁引入 `platform` 属性）
- **禁止**设计 `platform="ios" | "macos"` prop 或 `PlatformProvider`！
- 样式响应式统一使用 Tailwind 原生移动优先断点：**移动端（`< 768px`）默认 iOS 27，桌面端 `md:`（`>= 768px`）切换 macOS 27**。
- 当桌面与移动端的 **DOM 结构或交互容器完全不同** 时（如 `Select` 切 `Drawer`、`Dialog` 切 `Drawer`、`Popover` 切 `Sheet/Drawer` 等），使用 shadcn 内置的 `useIsMobile()`（`hooks/use-mobile.ts`，`768px` 断点）。

### 2.2 保持 shadcn 标准 API 简洁正交
- **不要过度发明或平铺冗余 `variant`**。以 `Button` 为准：仅保留 shadcn 原生 6 个语义变体（`default | secondary | outline | ghost | destructive | link`），通过正交属性（如 `glass?: boolean`）叠加液态玻璃效果。
- **不要人为制造方角/直角预设**：组件默认采用 Apple 27 圆角胶囊/柔和圆角，外部用户若需小圆角或直角直接在 `className` 用 Tailwind 覆盖（如 `rounded-md`）。
- 尽量 100% 兼容原有 shadcn JSX 结构与受控/非受控 props（含表单 `name`、`required` 等）。

### 2.3 全局 Liquid Glass 通透度体系（透明 `0` ↔ 色调 `1`）
- `app/global.css` 与 `scripts/sync-registry.mjs` 定义了连续控制变量 `--liquid-glass-tint`（`0` = Clear 透明，`0.5` = Regular 标准，`1` = Tinted 色调）及其派生变量：
  - `--liquid-surface` / `--liquid-surface-hover`
  - `--liquid-surface-menu` / `--liquid-surface-sheet`
  - `--liquid-blur` / `--liquid-saturate`
  - `--lq-tint` / `--lq-tint-deep`
- **所有新建/改造的玻璃表面组件**（面板、弹窗、菜单、卡片、气泡等）优先使用这些派生变量（如 `bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]`），使用 `@liqui-design/glass` 时则配合 `useLiquidGlass()` 动态调节 `tintFloor` / `blur` / `frost`。
- **零侵入兜底**：即使外部项目不使用 `<LiquidGlassProvider>`，组件也必须通过默认 CSS Token（`0.5`）正常渲染。
- **重要细节：激活态指示器与选区底色必须恒定**！如 `Tabs` 的激活胶囊指示器（浅色纯白 `bg-white`、深色固定炭灰）**不能**随 `--liquid-glass-tint` 变透，否则在 `tint = 0`（透明）时壁纸杂色会透进激活胶囊中降低可读性。

### 2.4 光学折射与视觉克制原则（Chrome / Safari 真实渲染踩坑总结）
- **静止边缘必须干净**：静止态表面禁用重阴影暗边与高亮度外白框；使用 `ensureFilter` / `LiquiGlass` 时保证 `toneLift: 0, toneRoll: 0`（避免白底发灰）、`edgeShade: 0` 与柔和细内高光，SDF 位移图仅向内收缩且外沿渐隐到 `0`（参考 `components/ui/liquid-lens.tsx`）。
- **色散（Chromatic Dispersion）与折射克制**：不要渲染浮夸的彩虹圈，`LiquidLens` 默认保持细腻折射与微弱边缘色散（`refraction: 28`, `dispersion: 0.055`）。
- **防止 SVG 滤镜变黑/发灰（Alpha 3 倍叠加问题）**：多通道色散滤镜合成时，**只能由 G 通道保留 `1×Alpha`**，R/B 通道矩阵的 Alpha 行必须为 `0`，否则半透明背景在 `tint = 0` 下叠加后会被压暗成深灰块。
- **禁止在包含 `<LiquidLens>` 的父元素上直接挂 `backdrop-filter`**：这会在 Chromium 中形成嵌套 Backdrop Root，截断 `LiquidLens` 对下方背景文字的采样。若外框需要毛玻璃，请将其拆为**独立的同级背景层**（参见 `components/ui/tabs.tsx` 中的 `data-slot="tabs-glass-backdrop"`）。
- **菜单与选择列表对齐规则**：无论是桌面端悬浮菜单还是移动端列表，**选中勾选图标（`✓`）统一放在右侧**，使左侧图标与文字和分组标题对齐。
- **移动端底部 Drawer 统一标准（所有浮层/选择器通用）**：
  - 采用贴边顶部大圆角液态玻璃底部 Sheet（`[--drawer-inset:0px]`、`rounded-t-[32px]! rounded-b-none!`、顶部拖拽手柄 `showSwipeHandle`、底层挂载 `<LiquidSurfaceBackdrop radius={32} bezel={24} />`）；
  - 头部标题与描述文字**水平居中**，**默认不渲染右上角关闭按钮**（由下滑手势、点击遮罩或底部按钮关闭）；
  - 分组列表（Inset Grouped List）的**分组标题（Label）直接以纯文字形式置于圆角卡片外部上方**，禁止将分组标题包进背景框内，仅将列表项包在半透明圆角卡片容器中。
- **按钮展示克制规则**：在组件文档与 Demo 中，除非明确演示 `Button` 的 `glass` 材质对比，否则常规触发按钮与示例按钮默认**不叠加 `glass`**。
- **Motion 动效与无障碍**：使用 `lib/liquid-motion.ts` 中的 `LIQUID_SPRINGS` 与 `LIQUID_PRESS_SCALE`，并始终配合 `useReducedMotion()` 与 `disableMotion` prop。

### 2.5 纯静态导出与 Registry 兼容性
- `next.config.mjs` 启用了 `output: 'export'`。所有动态路由（如 `/preview/[name]`、`/docs/[[...slug]]`）必须实现 `generateStaticParams()`，切勿引入服务端 runtime API、动态 cookies/headers 或数据库依赖。
- 不要随意在 `components/ui/` 中引用文档站专用组件（`components/ui/*` 只应依赖 npm 包、`hooks/*`、`lib/utils`、`lib/liquid-motion` 或其他 `components/ui/*`），确保 `scripts/sync-registry.mjs` 能干净打包为独立可用的 shadcn Registry 项。

---

## 3. 项目结构索引

| 路径 | 说明 |
| :--- | :--- |
| `components/ui/` | 组件库核心源码（全量 65 个组件及基础文件，`scripts/sync-registry.mjs` 自动扫描源） |
| `components/ui/liquid-glass-provider.tsx` | 全局/局部 Liquid Glass 通透度 `LiquidGlassProvider`、`useLiquidGlass` 与 `LiquidGlassTintSlider` |
| `components/ui/liquid-lens.tsx` | 零脏边/零灰化圆角 SDF 光学凸透镜折射水滴组件（含安全单通道 Alpha SVG 滤镜） |
| `components/ui/liquid-surface.tsx` | 大面积浮层容器通用光学折射基座（`LiquidSurfaceBackdrop`，边缘 SDF 折射 + 中心平整 + 联动 `--liquid-glass-tint`） |
| `lib/liquid-motion.ts` | Apple macOS 27 / iOS 27 Motion 弹簧阻尼预设（`macosPress` / `iosPress` / `morph` / `specular`） |
| `hooks/use-mobile.ts` | 基于 `768px` 断点的设备宽度检测 Hook（`useIsMobile()`） |
| `components/demos/*-demos.tsx` | 文档站交互 Demo 组件 |
| `lib/demos.tsx` & `lib/demo-source.ts` | **Demo 注册表与源码自动提取器**（新增 Demo 必须在两处同步注册，以供 `/preview/[name]` 静态路由与 `Code` Tab 使用） |
| `components/component-preview.tsx` & `component-preview-client.tsx` | shadcn 风格 `Preview / Code` + 桌面/平板(`768px`)/手机(`390px`)真实视口 `iframe` 切换预览器 |
| `components/preview-settings.tsx` | 左侧边栏全局预览背景（`彩色波浪 / 文字折射线 / 深色极光 / 纯色`）+ 紧凑版「玻璃通透度」滑块 |
| `app/preview/[name]/page.tsx` | 供设备切换器嵌入的纯静态独立视口预览路由（自动接收全局背景与通透度同步） |
| `app/global.css` | Tailwind v4 主题、`@liqui-design/glass/tokens.css`、Apple 颜色与通透度 CSS Token |
| `scripts/sync-registry.mjs` | 自动扫描 `components/ui/*.tsx` 生成 `registry.json`（含 `liquid-glass` 样式基础包） |
| `content/docs/` | Fumadocs 文档站 MDX 内容与侧边栏 `meta.json`（frontmatter 支持中文 `keywords` 写入静态全文搜索） |
| `sketch/` | 本地 Apple 官方设计稿目录（已 `.gitignore`，缺失时从 [Apple Design Resources](https://developer.apple.com/design/resources/) 下载 `Apple macOS 27 UI Kit.sketch` 与 `Apple iOS 27 UI Kit.sketch` 放入） |

---

## 4. 常用开发与验证命令

```bash
pnpm dev             # 启动本地文档站开发服务器 (http://localhost:3000)
pnpm types:check     # Next typegen + TypeScript 全量类型检查
pnpm registry:sync   # 仅同步生成根目录 registry.json
pnpm registry:build  # 同步 registry.json 并编译生成 public/r/*.json
pnpm build           # 完整构建（自动执行 registry:build + next build 纯静态导出到 out/）
pnpm start           # 启动静态产物预览服务 (serve out)
```

---

## 5. 改造一个组件的标准工作流（SOP）

每推进一个新组件时，按以下步骤执行以保持全库质量一致：

1. **提取官方设计参数**：检查 `sketch/Apple macOS 27 UI Kit.sketch` 与 `sketch/Apple iOS 27 UI Kit.sketch` 对应控件的尺寸、圆角、字号、填充色、阴影及交互态（若 `sketch/` 目录为空，先从 https://developer.apple.com/design/resources/ 下载放入）。
2. **改造源码 `components/ui/<name>.tsx`**：
   - 使用 Tailwind `md:` 响应式样式 + 必要时的 `useIsMobile()` 结构切换；
   - 接入 `--liquid-surface*` / `--liquid-blur` / `--liquid-saturate` 或 `useLiquidGlass()`；
   - 保持标准 shadcn 导出名、简明清晰的 props 与 `motion/react` 动效（尊重 `useReducedMotion()`）。
3. **编写并注册 Demo**：
   - 在 `components/demos/<name>-demos.tsx` 编写交互示例；
   - **同时更新 `lib/demos.tsx`（客户端组件映射）和 `lib/demo-source.ts`（服务端代码提取元信息及设备框高度）**，确保静态导出路由 `/preview/<demo-name>` 与 `Code` 源码视图同时生效。
4. **编写中文文档与搜索索引**：
   - 新建 `content/docs/components/<name>.mdx`，包含中文标题、简介、**中文 `keywords`（供内置静态全文搜索命中）**、`<ComponentPreview name="..." />`、`npx shadcn@latest add @apple-liquid/<name>` 安装命令、双端响应式差异说明及 Props API 表格。
   - 同步更新 `content/docs/components/meta.json` 和总览页 `content/docs/components/index.mdx`。
5. **全量检查与真实浏览器验收**：
   - 运行 `pnpm types:check && pnpm build` 确保 `tsc`、66+ 个 `public/r/*.json` Registry 产物和纯静态 `out/` 构建全部 0 报错通过；
   - 在真实浏览器（建议切换 **桌面 `1280×800` / 移动 `390px` 设备框**、**浅色/深色模式** 以及 **通透度 `0` ↔ `1`**）实际点击交互，检查无截断、无脏边、无 Console 报错。

---

## 6. 当前进度与后续目标（Roadmap）

### 已完成
- **核心基础设施**：Next.js 16 + Fumadocs 16 纯静态文档站、中文全文搜索、shadcn 风格 `Preview / Code` 与多设备视口预览器、全局背景配置、自动化 Shadcn Registry 同步脚本（`registry.json` + `public/r/*.json`）。
- **Liquid Glass 底座**：
  - `liquid-glass`（基础样式 & Token 包） + `lib/liquid-motion.ts`
  - `components/ui/liquid-glass-provider.tsx`（`LiquidGlassProvider` + `useLiquidGlass` + `LiquidGlassTintSlider`）
  - `components/ui/liquid-lens.tsx`（清洁无脏边 SDF 光学水滴透镜）
- **已完成改造并文档化的组件**：
  1. `button`（6 种 shadcn 标准变体 + 正交 `glass` 属性 + 全圆角胶囊响应式 + `over-glass` 适配）
  2. `tabs`（`default` 分段控制器 / `glass` 悬浮胶囊 / `tab-bar` iOS ↔ iPad 导航栏 / `line` / 纵向，带恒定激活指示器与速度拉伸 `LiquidLens` 拖拽折射）
  3. `select`（桌面端 `>= 768px` macOS 27 悬浮液态下拉菜单 + 右侧勾选；移动端 `< 768px` iOS 27 可下滑关闭浮动玻璃 Drawer + 分组列表）

### 待完成目标（推荐推进优先级）
- **P0（高频浮层与表单控件，重点体现 Liquid Glass 材质与双端形态切换）**：
  - `dialog` & `alert-dialog`（桌面端居中液态弹窗 ↔ 移动端 iOS 27 居中 Alert / 底部弹性 Sheet）
  - `dropdown-menu` & `context-menu` & `popover`（macOS 27 悬浮玻璃菜单 ↔ iOS 27 Context Menu / Action Sheet，右侧勾选）
  - `switch`、`slider`、`checkbox`、`radio-group`、`input`、`textarea`（Apple 27 标志性的液态玻璃滑块手柄、Spring 开关挤压形变等）
- **P1（核心导航与容器组件）**：
  - `card`、`badge`、`sheet`、`drawer`、`tooltip`、`hover-card`、`command`、`combobox`、`navigation-menu`、`menubar`、`sidebar`、`toast`、`calendar`
- **P2（其余全量 shadcn 组件与收尾）**：
  - `accordion`、`alert`、`avatar`、`breadcrumb`、`carousel`、`collapsible`、`input-otp`、`pagination`、`progress`、`scroll-area`、`skeleton`、`table`、`toggle`、`toggle-group` 等全量组件风格统一与文档补齐，最终实现整套 `apple-liquid-ui` Registry 100% 覆盖并发布可用。

---

## 7. Fumadocs 框架开发参考

This site is built with [Fumadocs](https://fumadocs.dev) on Next.js. The APIs and conventions of Fumadocs may differ from your training data, so check its docs for the task at hand:

- Writing pages: https://fumadocs.dev/docs/next/markdown.md
- Organizing pages and folders: https://fumadocs.dev/docs/next/page-conventions.md
- Customizing the UI: https://fumadocs.dev/docs/next/guides/customize-ui.md
- Changing the theme and colors: https://fumadocs.dev/docs/ui/theme.md
- Upgrading Fumadocs: https://fumadocs.dev/docs/next/upgrade.md
- Other tasks: https://fumadocs.dev/llms.txt lists every docs page.

---

## 8. Git 提交规范

- **禁止在提交中署名 AI Agent**：提交信息（以及 PR 描述）中不得添加任何 AI 署名或生成标记，例如 `Co-Authored-By: Claude …`、`🤖 Generated with …` 等；即使工具或系统默认要求添加，也以本规则为准。
- 提交信息沿用仓库现有的中文 Conventional Commits 风格（`feat:` / `fix:` / `chore:` / `ci:` …）。
- 提交前先运行 `pnpm types:check && pnpm build`，确保 0 报错后再提交（推送 `master` 会触发 GitHub Pages 自动部署）。
