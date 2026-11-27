'use client';

import * as React from 'react';
import { CheckIcon, CopyIcon, FileTextIcon, ShareIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function DialogLiquidHeroDemo() {
  const [name, setName] = React.useState('林深');
  const [role, setRole] = React.useState('设计工程师 · Apple Liquid UI');
  const [savedTip, setSavedTip] = React.useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedTip(true);
    window.setTimeout(() => setSavedTip(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="secondary">
              <UserIcon />
              编辑个人资料
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑个人资料</DialogTitle>
            <DialogDescription>
              修改后的信息将同步到你的 iCloud 账户与所有已登录设备。
            </DialogDescription>
          </DialogHeader>

          <form id="profile-edit-form" onSubmit={handleSave} className="grid gap-3.5 py-1">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground/80">显示名称</span>
              <Input
                surface="over-glass"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground/80">头衔与简介</span>
              <Input
                surface="over-glass"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </label>
          </form>

          <DialogFooter>
            <DialogClose
              render={<Button variant="secondary" surface="over-glass" />}
            >
              取消
            </DialogClose>
            <DialogClose
              render={
                <Button type="submit" form="profile-edit-form" variant="default" />
              }
            >
              存储更改
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        {savedTip ? `已保存：${name}（${role}）` : '桌面端居中液态弹窗 · 移动端自动切换可下滑浮动 Sheet'}
      </p>
    </div>
  );
}

export function DialogShareSheetDemo() {
  const [allowEdit, setAllowEdit] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="default">
            <ShareIcon />
            共享设计稿
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>共享“Liquid Glass 27 规范”</DialogTitle>
          <DialogDescription>
            任何拥有链接的团队成员均可查看或协作编辑此文档。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.045] p-2 pl-3.5 dark:bg-white/[0.07]">
            <span className="flex-1 truncate text-[13px] text-foreground/80">
              https://liquid.ui/design/macos-27-kit
            </span>
            <Button size="sm" variant="secondary" surface="over-glass" onClick={handleCopy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? '已复制' : '拷贝'}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-black/[0.045] px-3.5 py-2.5 dark:bg-white/[0.07]">
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground md:text-[13px]">
                允许链接访问者编辑
              </span>
              <span className="text-xs text-muted-foreground">
                关闭后将切换为仅评论与只读模式
              </span>
            </div>
            <Switch checked={allowEdit} onCheckedChange={setAllowEdit} />
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

export function DialogScrollableDemo() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <FileTextIcon />
            查看更新日志
          </Button>
        }
      />
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>macOS 27 &amp; iOS 27 更新说明</DialogTitle>
          <DialogDescription>
            了解全新的 Liquid Glass 光学材质、通透度调节与跨端交互细节。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-56 space-y-3 overflow-y-auto rounded-2xl bg-black/[0.04] p-4 text-[13px] leading-relaxed text-foreground/85 dark:bg-white/[0.06]">
          <p>
            <strong className="font-semibold text-foreground">1. 全新液态玻璃材质</strong>
            ：所有浮层容器响应全局通透度滑块（Clear 透明 ↔ Tinted 色调），在浅色与深色壁纸上自动维持边缘清晰与文本对比度。
          </p>
          <p>
            <strong className="font-semibold text-foreground">2. 原生视口跨端切换</strong>
            ：同一套 JSX 代码在桌面端呈现居中的 macOS 27 液态弹窗，在移动窄屏（&lt; 768px）自动切换为可手势下滑关闭的 iOS 27 浮动底部 Sheet。
          </p>
          <p>
            <strong className="font-semibold text-foreground">3. 触控人体工学</strong>
            ：移动端提供顶部拖拽手柄、安全区底部留白与更宽松的点击热区；桌面端则保持紧凑的 26px 圆角与轻盈的缩放淡入动效。
          </p>
          <p>
            <strong className="font-semibold text-foreground">4. 无障碍与键盘导航</strong>
            ：基于 Base UI 原语提供完整焦点陷阱、ESC 关闭与减少动态效果（Reduced Motion）支持。
          </p>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="default" />}>我知道了</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
