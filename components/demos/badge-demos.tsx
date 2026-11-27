'use client';

import * as React from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BadgeLiquidHeroDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <Badge variant="default">
        <SparklesIcon />
        Liquid Glass
      </Badge>
      <Badge variant="secondary">macOS 27</Badge>
      <Badge variant="outline">iOS 27</Badge>
      <Badge variant="destructive">
        <AlertTriangleIcon />
        需要更新
      </Badge>
      <Badge variant="ghost">草稿</Badge>
      <Badge variant="link" render={<a href="#props-api" />}>
        查看文档
      </Badge>
    </div>
  );
}

export function BadgeSizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge size="sm" variant="default">
        Small
      </Badge>
      <Badge size="default" variant="default">
        Default
      </Badge>
      <Badge size="lg" variant="default">
        <CheckCircle2Icon />
        Large
      </Badge>
    </div>
  );
}

export function BadgeGlassCompareDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="default">默认玻璃</Badge>
        <Badge variant="secondary">液态玻璃</Badge>
        <Badge variant="outline">玻璃描边</Badge>
        <Badge variant="destructive">警示玻璃</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge glass={false} variant="default">
          实体主色
        </Badge>
        <Badge glass={false} variant="secondary">
          实体次级
        </Badge>
        <Badge glass={false} variant="outline">
          纯描边
        </Badge>
        <Badge glass={false} variant="destructive">
          实体警示
        </Badge>
      </div>
    </div>
  );
}
