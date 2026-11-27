'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

const SYNC_ITEMS = [
  { id: 'photos', label: 'iCloud 照片', desc: '自动同步原片与实况照片' },
  { id: 'notes', label: '备忘录与提醒事项', desc: '在所有设备间保持实时一致' },
  { id: 'keychain', label: '密码与钥匙串', desc: '端到端加密自动填充登录凭证' },
] as const;

export function CheckboxLiquidHeroDemo() {
  const [selected, setSelected] = React.useState<string[]>(['photos', 'notes']);

  const allChecked = selected.length === SYNC_ITEMS.length;
  const isIndeterminate = selected.length > 0 && !allChecked;

  function toggleAll(checked: boolean) {
    setSelected(checked ? SYNC_ITEMS.map((item) => item.id) : []);
  }

  function toggleItem(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  }

  return (
    <Card className="w-full max-w-sm p-4 gap-0">
      <label className="flex cursor-pointer items-center gap-3 pb-3">
        <Checkbox
          checked={allChecked}
          indeterminate={isIndeterminate}
          onCheckedChange={(checked) => toggleAll(Boolean(checked))}
        />
        <span className="text-[15px] font-semibold text-foreground md:text-[13.5px]">
          同步全部 iCloud 数据（{selected.length}/{SYNC_ITEMS.length}）
        </span>
      </label>

      <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-black/[0.04] dark:divide-white/[0.08] dark:bg-white/[0.06]">
        {SYNC_ITEMS.map((item) => {
          const isChecked = selected.includes(item.id);
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) =>
                  toggleItem(item.id, Boolean(checked))
                }
              />
              <span className="flex flex-col">
                <span className="text-[14px] font-medium text-foreground md:text-[13px]">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.desc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </Card>
  );
}

export function CheckboxSizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox size="sm" defaultChecked />
        <span className="text-xs font-medium text-foreground">Small</span>
      </label>

      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox size="default" defaultChecked />
        <span className="text-sm font-medium text-foreground">Default</span>
      </label>

      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox size="lg" defaultChecked />
        <span className="text-sm font-medium text-foreground">Large</span>
      </label>

      <label className="flex cursor-not-allowed items-center gap-2.5 opacity-60">
        <Checkbox disabled defaultChecked />
        <span className="text-sm font-medium text-foreground">禁用已选</span>
      </label>

      <label className="flex cursor-not-allowed items-center gap-2.5 opacity-60">
        <Checkbox disabled />
        <span className="text-sm font-medium text-foreground">禁用未选</span>
      </label>
    </div>
  );
}

export function CheckboxGlassDemo() {
  const [items, setItems] = React.useState({
    handoff: true,
    clipboard: false,
    airdrop: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          glass
          checked={items.handoff}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, handoff: Boolean(checked) }))
          }
        />
        <span className="text-sm font-medium text-foreground">
          允许在这台 Mac 与 iCloud 设备之间使用接力
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          glass
          checked={items.clipboard}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, clipboard: Boolean(checked) }))
          }
        />
        <span className="text-sm font-medium text-foreground">
          启用通用剪贴板跨设备粘贴
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          glass
          checked={items.airdrop}
          onCheckedChange={(checked) =>
            setItems((prev) => ({ ...prev, airdrop: Boolean(checked) }))
          }
        />
        <span className="text-sm font-medium text-foreground">
          通过隔空投送自动接收来自联系人的文件
        </span>
      </label>
    </div>
  );
}
