'use client';

import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function InputLiquidHeroDemo() {
  const [query, setQuery] = React.useState('');

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-(--lq-text-dim) md:left-3 md:size-3.5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索 App、文稿或系统设置…"
          className="pl-10 md:pl-8.5"
        />
      </div>

      <Card className="p-4 gap-0">
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground/80">
              Apple 账户邮箱
            </span>
            <Input
              type="email"
              defaultValue="designer@apple-liquid-ui"
              placeholder="name@icloud.com"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground/80">
              设备名称
            </span>
            <Input
              defaultValue="MacBook Pro（Liquid Glass）"
            />
          </label>
        </div>
      </Card>
    </div>
  );
}

export function InputSizesDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input size="sm" placeholder="Small 尺寸输入框" />
      <Input size="default" placeholder="Default 标准输入框（默认）" />
      <Input size="lg" placeholder="Large 大号输入框" />
    </div>
  );
}

export function InputStatesDemo() {
  const [email, setEmail] = React.useState('invalid-email');
  const isInvalid = email.length > 0 && !email.includes('@');

  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="grid gap-1.5">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={isInvalid}
          placeholder="输入有效邮箱地址"
        />
        {isInvalid ? (
          <span className="text-xs text-(--apple-red)">
            请输入包含 @ 的有效邮箱格式
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">邮箱格式正确</span>
        )}
      </div>

      <Input disabled defaultValue="已锁定的只读配置项" />

      <div className="flex items-center gap-2">
        <Input type="password" defaultValue="liquid-glass-27" />
        <Button variant="secondary" size="sm">
          验证
        </Button>
      </div>
    </div>
  );
}
