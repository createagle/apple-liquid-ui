'use client';

import * as React from 'react';
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  FileTextIcon,
  FolderOpenIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';

export function CommandLiquidHeroDemo() {
  const [open, setOpen] = React.useState(false);
  const [lastAction, setLastAction] = React.useState<string>(
    '点击触发器或按 ⌘J / Ctrl+J 打开'
  );

  const runAction = (label: string) => {
    setLastAction(`已执行：${label}`);
    setOpen(false);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <Button
        glass
        variant="secondary"
        className="w-full justify-between px-3.5 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2 truncate">
          <SearchIcon className="size-4 shrink-0" />
          <span className="truncate">搜索应用、文档或系统设置…</span>
        </span>
        <Kbd className="hidden md:inline-flex">⌘J</Kbd>
      </Button>
      <p className="text-center text-xs text-muted-foreground">{lastAction}</p>

      <CommandDialog open={open} onOpenChange={setOpen} shortcut="j">
        <Command>
          <CommandInput placeholder="搜索应用、文档或系统设置…" />
          <CommandList>
            <CommandEmpty>未找到匹配的命令</CommandEmpty>
            <CommandGroup heading="建议操作">
              <CommandItem onSelect={() => runAction('日历')}>
                <CalendarIcon />
                <span>日历</span>
                <CommandShortcut>⌘1</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runAction('快速计算')}>
                <CalculatorIcon />
                <span>快速计算</span>
                <CommandShortcut>⌘2</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runAction('切换液态玻璃外观')}>
                <SparklesIcon />
                <span>切换液态玻璃外观</span>
                <CommandShortcut>⇧⌘L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="系统设置">
              <CommandItem onSelect={() => runAction('个人资料')}>
                <UserIcon />
                <span>个人资料</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runAction('账单与订阅')}>
                <CreditCardIcon />
                <span>账单与订阅</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runAction('系统偏好设置')}>
                <SettingsIcon />
                <span>系统偏好设置</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button glass variant="secondary" onClick={() => setOpen(true)}>
        <SearchIcon className="size-4" />
        <span>打开文件快捷跳转</span>
        <Kbd className="ml-1 hidden md:inline-flex">⇧⌘K</Kbd>
      </Button>
      {selected && (
        <span className="text-xs text-muted-foreground">
          上次执行：{selected}
        </span>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shortcut="shift+k"
        title="快捷跳转"
      >
        <Command>
          <CommandInput placeholder="输入文件名或快捷操作…" />
          <CommandList>
            <CommandEmpty>没有找到相关结果</CommandEmpty>
            <CommandGroup heading="最近文件">
              <CommandItem
                onSelect={() => {
                  setSelected('Apple_UI_Kit_27.sketch');
                  setOpen(false);
                }}
              >
                <FileTextIcon />
                <span>Apple_UI_Kit_27.sketch</span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSelected('组件改造规范.md');
                  setOpen(false);
                }}
              >
                <FolderOpenIcon />
                <span>组件改造规范.md</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="快捷控制">
              <CommandItem
                onSelect={() => {
                  setSelected('切换深浅色模式');
                  setOpen(false);
                }}
              >
                <MoonIcon />
                <span>切换深浅色模式</span>
                <CommandShortcut>⇧⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSelected('打开系统设置');
                  setOpen(false);
                }}
              >
                <SettingsIcon />
                <span>打开系统设置</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
