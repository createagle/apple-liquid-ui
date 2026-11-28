'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export function TextareaLiquidHeroDemo() {
  const [note, setNote] = React.useState(
    'Apple 27 Liquid Glass 规范：桌面端保持 13px 紧凑信息密度与清晰蓝光聚焦环，移动端自动放大为 16px 防缩放触控输入体验。'
  );

  return (
    <Card className="w-full max-w-md p-4 gap-0">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[14px] font-semibold text-foreground md:text-[13px]">
          快速备忘录
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {note.length} 字
        </span>
      </div>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="输入设计评审记录或随手灵感…"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setNote('')}
        >
          清空
        </Button>
        <Button size="sm" variant="default">
          保存到备忘录
        </Button>
      </div>
    </Card>
  );
}

export function TextareaGlassDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Textarea placeholder="默认即为液态玻璃多行输入框，实时响应左侧通透度滑块…" />
      <Textarea
        glass={false}
        placeholder="传入 glass={false} 可切换为高对比度实体输入框…"
      />
    </div>
  );
}

export function TextareaStatesDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Textarea
        size="sm"
        placeholder="Small 紧凑多行输入（支持自动随内容增高）"
      />
      <Textarea
        aria-invalid
        defaultValue="内容超出 200 字限制，请精简后再提交。"
      />
      <Textarea disabled defaultValue="该审核意见已归档，无法继续编辑。" />
    </div>
  );
}
