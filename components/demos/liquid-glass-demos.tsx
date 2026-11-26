'use client';

import * as React from 'react';
import {
  CopyIcon,
  EllipsisIcon,
  MenuIcon,
  SearchIcon,
  ShareIcon,
  SparklesIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LiquidGlassProvider,
  LiquidGlassTintSlider,
} from '@/components/ui/liquid-glass-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LiquidGlassSettingsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {/* Apple System Settings -> Appearance -> Liquid Glass live showcase card */}
      <div className="relative overflow-hidden rounded-[26px] border border-black/[0.08] bg-neutral-900 shadow-lg dark:border-white/12">
        {/* Scenic architectural gradient & foliage backdrop */}
        <div className="relative h-44 overflow-hidden bg-[linear-gradient(180deg,#60a5fa_0%,#93c5fd_42%,#365314_44%,#1a2e05_100%)] p-4">
          <div className="absolute -top-6 right-[-10%] h-36 w-56 rounded-full bg-[linear-gradient(135deg,#f8fafc_0%,#cbd5e1_50%,#0284c7_100%)] opacity-90 shadow-inner" />
          <div className="absolute right-0 bottom-0 left-0 h-16 bg-[radial-gradient(ellipse_at_bottom,#14532d_0%,#052e16_75%,transparent_100%)] opacity-95" />

          {/* Floating Liquid Glass toolbar over bright scene (macOS 27 preview style) */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="inline-flex h-10 items-center gap-3 rounded-full bg-(--liquid-surface) px-3.5 text-neutral-900 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.85)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:text-white">
              <ShareIcon className="size-4" />
              <EllipsisIcon className="size-4" />
            </div>
            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-(--liquid-surface) text-neutral-900 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.85)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:text-white">
              <CopyIcon className="size-4" />
            </div>
            <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-(--liquid-surface) px-3.5 text-sm text-neutral-800/80 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.85)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:text-white/85">
              <SearchIcon className="size-4 shrink-0 opacity-75" />
              <span className="truncate">搜索</span>
            </div>
          </div>
        </div>

        {/* Lower dark content area with overlapping glass controls (iOS 27 preview style) */}
        <div className="relative bg-neutral-900 px-5 pt-4 pb-5 text-left text-white">
          <p className="text-lg font-semibold tracking-tight">
            欢迎来到 Apple Park
          </p>
          <p className="mt-0.5 text-sm text-white/60">加利福尼亚，库比蒂诺</p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            探索 Apple Park 的设计与历史，领略其独特的自然之美与通透玻璃层次。
          </p>

          <div className="-mt-7 flex items-center gap-2.5">
            <Button
              variant="secondary"
              glass
              size="icon"
              aria-label="菜单"
              className="dark text-white"
            >
              <MenuIcon />
            </Button>
            <div className="dark flex h-10 flex-1 items-center gap-2 rounded-full bg-(--liquid-surface) px-4 text-sm text-white/90 shadow-[0_10px_28px_-6px_rgba(0,0,0,0.48),0_0_0_0.5px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.22)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]">
              <SearchIcon className="size-4 shrink-0 opacity-80" />
              <span>搜索内容与控制项</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Apple Settings Clear <-> Tinted Slider controlling global LiquidGlassProvider */}
      <div className="rounded-2xl bg-background/85 p-3.5 shadow-xs ring-1 ring-border/70 backdrop-blur-md">
        <LiquidGlassTintSlider showDescription />
      </div>
    </div>
  );
}

export function LiquidGlassScopedCompareDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
      <LiquidGlassProvider syncToRoot={false} defaultTint="clear">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/25 bg-black/5 p-5 backdrop-blur-xs dark:bg-white/5">
          <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
            透明 Clear (tint = 0)
          </span>
          <Tabs defaultValue="glass">
            <TabsList variant="glass">
              <TabsTrigger value="glass">液态</TabsTrigger>
              <TabsTrigger value="optics">通透</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="secondary" glass size="sm">
              次要操作
            </Button>
            <Button glass size="sm">
              <SparklesIcon />
              主操作
            </Button>
          </div>
        </div>
      </LiquidGlassProvider>

      <LiquidGlassProvider syncToRoot={false} defaultTint="tinted">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/25 bg-black/5 p-5 backdrop-blur-xs dark:bg-white/5">
          <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
            色调 Tinted (tint = 1)
          </span>
          <Tabs defaultValue="glass">
            <TabsList variant="glass">
              <TabsTrigger value="glass">液态</TabsTrigger>
              <TabsTrigger value="optics">高对比</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="secondary" glass size="sm">
              次要操作
            </Button>
            <Button glass size="sm">
              <SparklesIcon />
              主操作
            </Button>
          </div>
        </div>
      </LiquidGlassProvider>
    </div>
  );
}
