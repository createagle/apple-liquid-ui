'use client';

import * as React from 'react';
import {
  CompassIcon,
  Gamepad2Icon,
  HomeIcon,
  LayersIcon,
  PlusIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export function TabsLiquidHeroDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <Tabs defaultValue="glass" className="w-full items-center">
        <TabsList variant="glass">
          <TabsTrigger value="glass">
            <SparklesIcon />
            液态玻璃
          </TabsTrigger>
          <TabsTrigger value="optics">
            <LayersIcon />
            光学折射
          </TabsTrigger>
          <TabsTrigger value="motion">
            <SlidersHorizontalIcon />
            弹簧动效
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glass" className="w-full">
          <Card className="p-5 text-left gap-0">
            <p className="text-sm font-semibold text-foreground">
              静止干净通透 · 按住左右拖动浮起棱镜水滴
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              静止状态下四边与四角干净利落；按住滑块左右拖动或切换时，透明折射透镜水滴会突出悬浮在标签之上，以零灰底和彩虹色散边缘实时折弯下方图标与文字。
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="optics" className="w-full">
          <Card className="p-5 text-left gap-0">
            <p className="text-sm font-semibold text-foreground">
              纯向内 SDF 折射贴图（零脏边、零灰底）
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              通过向内采样圆角 SDF 并在最外沿平滑归零，配合 toneLift=0 / toneRoll=0 跳过灰阶压缩，彻底消除边缘采样脏色与四角发灰。
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="motion" className="w-full">
          <Card className="p-5 text-left gap-0">
            <p className="text-sm font-semibold text-foreground">
              速度感应液态拉伸（Squash &amp; Stretch）
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              基于 Motion useVelocity 与 useSpring，快速拖拽或点击切换时水滴会沿运动方向自然拉长，松手后弹回目标位并平滑融入干净激活态。
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TabsFloatingTabBarDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      {/* Realistic iOS App Feed backdrop matching native Apple Liquid Glass comparison */}
      <div className="relative flex w-full flex-col justify-end overflow-hidden rounded-3xl border border-black/[0.06] bg-white px-5 pt-7 pb-5 shadow-xs dark:border-white/10 dark:bg-neutral-950">
        <div
          aria-hidden="true"
          className="mb-1 flex items-end justify-between gap-4 select-none"
        >
          <div className="space-y-1.5 text-left">
            <p className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
              《源起》是一款长线运营的视觉作品
            </p>
            <p className="text-xs text-neutral-400">
              2 小时前 · 按住下方 Tab Bar 左右拖动查看棱镜折射
            </p>
          </div>
          <div className="h-16 w-32 shrink-0 rounded-2xl bg-[linear-gradient(135deg,#18181b_0%,#3f3f46_45%,#92400e_100%)] shadow-inner" />
        </div>

        <div className="-mt-7 flex justify-center">
          <Tabs defaultValue="home" className="items-center">
            <TabsList variant="tab-bar">
              <TabsTrigger value="home">
                <HomeIcon />
                <span>首页</span>
              </TabsTrigger>
              <TabsTrigger value="hot">
                <CompassIcon />
                <span>热门</span>
              </TabsTrigger>
              <TabsTrigger value="create">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-neutral-800 text-white dark:bg-white dark:text-neutral-950">
                  <PlusIcon className="size-4" />
                </span>
              </TabsTrigger>
              <TabsTrigger value="library">
                <Gamepad2Icon />
                <span>游戏库</span>
              </TabsTrigger>
              <TabsTrigger value="me">
                <UserIcon />
                <span>我</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        按住上方导航栏左右拖动：透明水滴透镜会越过边沿放大并产生彩虹棱镜折射，松手后恢复干净激活态
      </p>
    </div>
  );
}

export function TabsSegmentedDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Tabs defaultValue="day" className="items-center">
        <TabsList variant="default">
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">周</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
          <TabsTrigger value="year">年</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export function TabsLineDemo() {
  return (
    <Card className="w-full max-w-md gap-0 p-5">
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="overview" className="flex-none">
            概览
          </TabsTrigger>
          <TabsTrigger value="specs" className="flex-none">
            设计规格
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-none">
            API 参数
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-3 text-muted-foreground">
          极简下划线变体适合常规内容区或表单设置页，内置 Apple Blue 弹簧滑动指示条。
        </TabsContent>
        <TabsContent value="specs" className="pt-3 text-muted-foreground">
          移动端采用 40px 触控高度与 15px 字体；桌面端自动切换为 36px 高度与 13.5px 字体。
        </TabsContent>
        <TabsContent value="api" className="pt-3 text-muted-foreground">
          100% 兼容 @base-ui/react/tabs 与 shadcn/ui 标准受控/非受控 API，支持键盘方向键切换。
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export function TabsVerticalDemo() {
  return (
    <div className="w-full max-w-lg">
      <Tabs
        defaultValue="appearance"
        orientation="vertical"
        className="items-stretch gap-4"
      >
        <TabsList variant="glass" className="w-40">
          <TabsTrigger value="appearance">
            <SparklesIcon />
            外观与玻璃
          </TabsTrigger>
          <TabsTrigger value="layout">
            <LayersIcon />
            响应式断点
          </TabsTrigger>
          <TabsTrigger value="prefs">
            <SettingsIcon />
            高级设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card className="h-full p-5 gap-0">
            <p className="text-sm font-semibold">外观与液态玻璃</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              支持纵向侧边玻璃选项卡（orientation=&quot;vertical&quot;），点击切换时玻璃透镜沿纵轴顺滑弹跳。
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="layout">
          <Card className="h-full p-5 gap-0">
            <p className="text-sm font-semibold">响应式断点</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              通过原生 Tailwind md: 断点与 useIsMobile()，无需手传任何平台属性即可适配桌面与移动端。
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="prefs">
          <Card className="h-full p-5 gap-0">
            <p className="text-sm font-semibold">高级设置</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              自动尊重系统 prefers-reduced-motion 无障碍偏好，并可通过 refraction / dispersion 调节棱镜色散强度。
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
