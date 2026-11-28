'use client';

import * as React from 'react';
import {
  ArrowRightIcon,
  HeartIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LiquidSurfaceBackdrop,
  OverGlass,
} from '@/components/ui/liquid-surface';

export function ButtonLiquidHeroDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>
          <SparklesIcon />
          立即体验
        </Button>
        <Button variant="secondary">
          了解更多
          <ArrowRightIcon />
        </Button>
        <Button variant="destructive">
          <Trash2Icon />
          删除项目
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="icon" aria-label="播放">
          <PlayIcon />
        </Button>
        <Button variant="secondary" size="icon" aria-label="喜欢">
          <HeartIcon />
        </Button>
        <Button variant="secondary" size="icon" aria-label="分享">
          <ShareIcon />
        </Button>
        <Button size="icon" aria-label="新建">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}

export function ButtonAllVariantsDemo() {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="default" glass>
          Default + Glass
        </Button>
        <Button variant="secondary" glass>
          Secondary + Glass
        </Button>
        <Button variant="destructive" glass>
          Destructive + Glass
        </Button>
        <Button variant="secondary" glass disabled>
          Disabled
        </Button>
      </div>
    </div>
  );
}

export function ButtonSizesDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="xs">
          XS
        </Button>
        <Button variant="secondary" size="sm">
          Small
        </Button>
        <Button variant="secondary" size="default">
          Default
        </Button>
        <Button variant="secondary" size="lg">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="default" size="xs">
          XS
        </Button>
        <Button variant="default" size="sm">
          Small
        </Button>
        <Button variant="default" size="default">
          Default
        </Button>
        <Button variant="default" size="lg">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="icon-xs" aria-label="XS 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Small 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Default 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" size="icon-lg" aria-label="Large 图标">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}

export function ButtonOverGlassDemo() {
  // A glass toolbar: buttons on it switch to the kit's flat Over-Glass fills
  // automatically (`glass` is ignored there: Apple never stacks glass on glass).
  return (
    <div className="relative isolate flex flex-wrap items-center gap-2.5 rounded-full px-4 py-2.5 shadow-[0_18px_46px_-10px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_22px_54px_-10px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.2)]">
      <LiquidSurfaceBackdrop size="medium" radius="auto" bezel={16} />
      <OverGlass>
        <Button variant="default" glass size="sm">
          应用更改
        </Button>
        <Button variant="secondary" glass size="sm">
          Over-glass 按钮
        </Button>
        <Button variant="ghost" size="sm">
          取消
        </Button>
      </OverGlass>
    </div>
  );
}
