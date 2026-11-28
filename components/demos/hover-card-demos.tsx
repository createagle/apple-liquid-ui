'use client';

import * as React from 'react';
import {
  CalendarIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  SparklesIcon,
  StarIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export function HoverCardLiquidHeroDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <HoverCard>
        <HoverCardTrigger
          render={
            <Button glass variant="secondary">
              <SparklesIcon className="size-4 text-(--apple-blue)" />
              @apple-liquid/ui
            </Button>
          }
        />
        <HoverCardContent className="w-80">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--apple-blue)/15 text-(--apple-blue) dark:bg-(--apple-blue)/22">
              <SparklesIcon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-semibold text-foreground">
                  Apple Liquid UI
                </span>
                <Badge size="sm">v27</Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                基于 shadcn/ui 与 Tailwind v4 打造的 macOS 27 &amp; iOS 27 响应式液态玻璃组件库。
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  2026 年 11 月更新
                </span>
                <span className="inline-flex items-center gap-1">
                  <StarIcon className="size-3 text-[#FF9500]" />
                  23 个组件已上线
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export function HoverCardProfileDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
      <span>由</span>
      <HoverCard>
        <HoverCardTrigger
          render={
            <Button glass
              variant="link"
              className="h-auto p-0 font-medium text-foreground underline-offset-4"
            >
              Design Systems Team
            </Button>
          }
        />
        <HoverCardContent side="top" className="w-72">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-[#007AFF] to-[#5856D6] text-xs font-semibold text-white">
                DS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Design Systems Team
                </span>
                <span className="text-xs text-muted-foreground">
                  @apple-liquid-core
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              专注光学折射、跨端触控人体工学与零侵入 shadcn Registry 分发体验。
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitBranchIcon className="size-3.5" />
              <span>master · 静态导出就绪</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <span>维护并持续同步 Apple 官方设计规范。</span>
    </div>
  );
}

export function HoverCardLinkPreviewDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <HoverCard>
        <HoverCardTrigger
          render={
            <Button glass variant="secondary" size="sm">
              <ExternalLinkIcon className="size-3.5" />
              悬停预览光学规范
            </Button>
          }
        />
        <HoverCardContent side="right" className="w-76">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold uppercase tracking-wide text-(--apple-blue)">
                Liquid Glass Optics
              </span>
              <Badge variant="secondary" size="sm">
                SDF Lens
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground">
              边缘光学折射 + 中心清晰可读
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              通过独立层 LiquidSurfaceBackdrop 渲染真实 SVG 位移折射，并随全局 --liquid-glass-tint 平滑过渡。
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
