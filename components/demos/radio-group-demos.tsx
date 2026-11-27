'use client';

import * as React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

const AIRDROP_OPTIONS = [
  {
    value: 'off',
    title: '接收关闭',
    desc: '不会收到任何隔空投送请求。',
  },
  {
    value: 'contacts',
    title: '仅限联系人',
    desc: '只有通讯录中的联系人可以看到你的设备。',
  },
  {
    value: 'everyone',
    title: '所有人（10 分钟）',
    desc: '附近所有 Apple 设备均可在 10 分钟内向你发送文件。',
  },
] as const;

export function RadioGroupLiquidHeroDemo() {
  const [mode, setMode] = React.useState('contacts');

  return (
    <Card className="w-full max-w-sm p-4 gap-0">
      <div className="pb-2.5">
        <p className="text-[15px] font-semibold text-foreground md:text-[13.5px]">
          隔空投送接收权限
        </p>
        <p className="text-xs text-muted-foreground">
          选择允许向这台设备发起隔空投送的对象范围。
        </p>
      </div>

      <RadioGroup
        value={mode}
        onValueChange={(value) => setMode(String(value))}
        className="gap-0 divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-black/[0.04] dark:divide-white/[0.08] dark:bg-white/[0.06]"
      >
        {AIRDROP_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
          >
            <RadioGroupItem value={option.value} />
            <span className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground md:text-[13px]">
                {option.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.desc}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </Card>
  );
}

export function RadioGroupSizesDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Small</span>
        <RadioGroup size="sm" defaultValue="s1">
          <label className="flex cursor-pointer items-center gap-2">
            <RadioGroupItem value="s1" />
            <span className="text-xs text-foreground">紧凑间距</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <RadioGroupItem value="s2" />
            <span className="text-xs text-foreground">默认间距</span>
          </label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <RadioGroup size="default" defaultValue="d1">
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="d1" />
            <span className="text-sm text-foreground">标准模式</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="d2" />
            <span className="text-sm text-foreground">节能模式</span>
          </label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Large</span>
        <RadioGroup size="lg" defaultValue="l1">
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="l1" />
            <span className="text-sm text-foreground">高刷 120Hz</span>
          </label>
          <label className="flex cursor-not-allowed items-center gap-2.5 opacity-55">
            <RadioGroupItem value="l2" disabled />
            <span className="text-sm text-foreground">锁定 60Hz（禁用）</span>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}

export function RadioGroupGlassDemo() {
  const [quality, setQuality] = React.useState('lossless');

  return (
    <RadioGroup
      glass
      value={quality}
      onValueChange={(value) => setQuality(String(value))}
      className="max-w-xs gap-3"
    >
      <label className="flex cursor-pointer items-center gap-3">
        <RadioGroupItem value="aac" />
        <span className="text-sm font-medium text-foreground">
          高质量（AAC 256 kbps）
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <RadioGroupItem value="lossless" />
        <span className="text-sm font-medium text-foreground">
          无损压缩（ALAC 24-bit / 48 kHz）
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <RadioGroupItem value="hi-res" />
        <span className="text-sm font-medium text-foreground">
          高解析度无损（ALAC 24-bit / 192 kHz）
        </span>
      </label>
    </RadioGroup>
  );
}
