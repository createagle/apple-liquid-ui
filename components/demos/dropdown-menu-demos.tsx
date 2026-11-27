'use client';

import * as React from 'react';
import {
  ArrowDownUpIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  FileEditIcon,
  FolderOpenIcon,
  MailIcon,
  Share2Icon,
  SparklesIcon,
  Trash2Icon,
  WifiIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DropdownMenuLiquidHeroDemo() {
  const [lastAction, setLastAction] = React.useState('点击按钮展开液态玻璃菜单');

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="secondary">
              文件操作
              <ChevronDownIcon className="opacity-70" />
            </Button>
          }
        />
        <DropdownMenuContent title="文件操作" className="w-60 md:w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>常用操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setLastAction('已执行：快速查看')}>
              <EyeIcon />
              快速查看
              <DropdownMenuShortcut>Space</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLastAction('已执行：重命名')}>
              <FileEditIcon />
              重命名
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLastAction('已执行：制作副本')}>
              <CopyIcon />
              制作副本
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Share2Icon />
                共享
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => setLastAction('已通过 隔空投送 共享')}
                >
                  <WifiIcon />
                  隔空投送
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLastAction('已拷贝共享链接')}
                >
                  <CopyIcon />
                  拷贝链接
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLastAction('已通过 邮件 发送')}
                >
                  <MailIcon />
                  邮件发送
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              onClick={() => setLastAction('已在访达中显示')}
            >
              <FolderOpenIcon />
              在访达中显示
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <SparklesIcon />
              智能摘要（需升级）
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setLastAction('已移到废纸篓')}
          >
            <Trash2Icon />
            移到废纸篓
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        {lastAction}
      </p>
    </div>
  );
}

export function DropdownMenuCheckboxesDemo() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showPathBar, setShowPathBar] = React.useState(false);
  const [autoHideSidebar, setAutoHideSidebar] = React.useState(true);

  const activeLabels = [
    showStatusBar && '状态栏',
    showPathBar && '路径栏',
    autoHideSidebar && '自动隐藏边栏',
  ].filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="secondary">
              显示选项
              <ChevronDownIcon className="opacity-70" />
            </Button>
          }
        />
        <DropdownMenuContent title="显示选项" className="w-60 md:w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>界面元素</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={showStatusBar}
              onCheckedChange={(checked) => setShowStatusBar(Boolean(checked))}
            >
              显示状态栏
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showPathBar}
              onCheckedChange={(checked) => setShowPathBar(Boolean(checked))}
            >
              显示路径栏
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={autoHideSidebar}
              onCheckedChange={(checked) => setAutoHideSidebar(Boolean(checked))}
            >
              自动隐藏边栏
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {activeLabels.length > 0 ? (
          activeLabels.map((label) => (
            <Badge key={String(label)} variant="secondary" size="sm">
              <CheckCircle2Icon data-icon="inline-start" className="text-(--apple-blue)" />
              {label}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" size="sm" className="font-normal text-muted-foreground">
            未启用任何界面元素
          </Badge>
        )}
      </div>
    </div>
  );
}

const SORT_LABELS: Record<string, string> = {
  name: '名称',
  date: '修改日期',
  size: '文件大小',
  kind: '种类',
};

export function DropdownMenuRadioGroupDemo() {
  const [sortBy, setSortBy] = React.useState('date');

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="secondary">
              <ArrowDownUpIcon />
              排序方式：{SORT_LABELS[sortBy] ?? sortBy}
            </Button>
          }
        />
        <DropdownMenuContent title="排序方式" className="w-56 md:w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>排序依据</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(value) => setSortBy(String(value))}
            >
              <DropdownMenuRadioItem value="name">名称</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">修改日期</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="size">文件大小</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="kind">种类</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        当前排列：{SORT_LABELS[sortBy] ?? sortBy}
      </p>
    </div>
  );
}
