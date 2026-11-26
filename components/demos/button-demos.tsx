'use client';

import * as React from 'react';
import { LiquiGlass } from '@liqui-design/glass';
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

export function ButtonLiquidHeroDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button glass>
          <SparklesIcon />
          Liquid Primary
        </Button>
        <Button variant="secondary" glass>
          Liquid Glass
          <ArrowRightIcon />
        </Button>
        <Button variant="destructive" glass>
          <Trash2Icon />
          删除项目
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" glass size="icon" aria-label="播放">
          <PlayIcon />
        </Button>
        <Button variant="secondary" glass size="icon" aria-label="喜欢">
          <HeartIcon />
        </Button>
        <Button variant="secondary" glass size="icon" aria-label="分享">
          <ShareIcon />
        </Button>
        <Button glass size="icon" aria-label="新建">
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
        <Button variant="secondary" glass size="xs">
          XS
        </Button>
        <Button variant="secondary" glass size="sm">
          Small
        </Button>
        <Button variant="secondary" glass size="default">
          Default
        </Button>
        <Button variant="secondary" glass size="lg">
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
        <Button variant="secondary" glass size="icon-xs" aria-label="XS 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" glass size="icon-sm" aria-label="Small 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" glass size="icon" aria-label="Default 图标">
          <PlusIcon />
        </Button>
        <Button variant="secondary" glass size="icon-lg" aria-label="Large 图标">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}

export function ButtonOverGlassDemo() {
  return (
    <LiquiGlass
      radius={999}
      lightAngle={-45}
      edgeShade={0.12}
      hairline={0.34}
      refraction={65}
      bezel={16}
      frost={0.22}
      elevated
      contentClassName="flex flex-wrap items-center gap-2.5 px-4 py-2.5"
    >
      <Button variant="default" surface="over-glass" size="sm">
        应用更改
      </Button>
      <Button variant="secondary" surface="over-glass" size="sm">
        Over-glass 按钮
      </Button>
      <Button variant="ghost" surface="over-glass" size="sm">
        取消
      </Button>
    </LiquiGlass>
  );
}
