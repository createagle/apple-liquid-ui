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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
            <Button
              variant="secondary"
              glass
              size="icon"
              aria-label="分享"
            >
              <ShareIcon />
            </Button>
            <Button
              variant="secondary"
              glass
              size="icon"
              aria-label="更多操作"
            >
              <EllipsisIcon />
            </Button>
            <Button
              variant="secondary"
              glass
              size="icon"
              aria-label="复制"
            >
              <CopyIcon />
            </Button>
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-(--lq-text-dim) md:left-3 md:size-3.5" />
              <Input
                placeholder="搜索"
                aria-label="搜索"
                className="pl-10 md:pl-8.5"
              />
            </div>
          </div>
        </div>

        {/* Lower dark content area with Liquid Glass controls (iOS 27 preview style) */}
        <div className="dark relative bg-neutral-900 px-5 pt-4 pb-5 text-left text-white">
          <p className="text-lg font-semibold tracking-tight">
            欢迎来到 Apple Park
          </p>
          <p className="mt-0.5 text-sm text-white/60">加利福尼亚，库比蒂诺</p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">
            探索 Apple Park 的设计与历史，领略其独特的自然之美与通透玻璃层次。
          </p>

          <div className="mt-4 flex items-center gap-2.5">
            <Button
              variant="secondary"
              glass
              size="icon"
              aria-label="菜单"
            >
              <MenuIcon />
            </Button>
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-white/65 md:left-3 md:size-3.5" />
              <Input
                placeholder="搜索内容与控制项"
                aria-label="搜索内容与控制项"
                className="pl-10 text-white placeholder:text-white/65 md:pl-8.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Apple Settings Clear <-> Tinted Slider controlling global LiquidGlassProvider */}
      <Card size="sm" className="w-full">
        <CardContent>
          <LiquidGlassTintSlider showDescription />
        </CardContent>
      </Card>
    </div>
  );
}

export function LiquidGlassScopedCompareDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
      <LiquidGlassProvider syncToRoot={false} defaultTint="clear">
        <Card size="sm" className="w-full">
          <CardContent className="flex flex-col items-center gap-3 py-2">
            <Badge variant="secondary" size="sm" glass={false}>
              透明 Clear (tint = 0)
            </Badge>
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
          </CardContent>
        </Card>
      </LiquidGlassProvider>

      <LiquidGlassProvider syncToRoot={false} defaultTint="tinted">
        <Card size="sm" className="w-full">
          <CardContent className="flex flex-col items-center gap-3 py-2">
            <Badge variant="secondary" size="sm" glass={false}>
              色调 Tinted (tint = 1)
            </Badge>
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
          </CardContent>
        </Card>
      </LiquidGlassProvider>
    </div>
  );
}
