'use client';

import * as React from 'react';
import { CloudOffIcon, MailIcon, Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function AlertDialogLiquidHeroDemo() {
  const [status, setStatus] = React.useState<string>('点击触发 Apple 27 液态警示框');

  return (
    <div className="flex flex-col items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="secondary">
              <MailIcon />
              关闭未发送邮件
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-(--apple-blue)/12 text-(--apple-blue)">
              <MailIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>将此信息存储为草稿？</AlertDialogTitle>
            <AlertDialogDescription>
              此信息尚未发送。你可以将其存储到草稿箱，稍后在任意设备上继续编辑。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatus('已取消关闭')}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setStatus('已存储为草稿')}>
              存储
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-muted-foreground">{status}</p>
    </div>
  );
}

export function AlertDialogDestructiveDemo() {
  const [deleted, setDeleted] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="destructive">
              <Trash2Icon />
              删除 iCloud 备份
            </Button>
          }
        />
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-(--apple-red)/14 text-(--apple-red)">
              <CloudOffIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>永久删除此备份？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复该设备的 18.4 GB 历史快照与照片索引，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>保留</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setDeleted(true)}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {deleted ? (
        <p className="text-xs text-(--apple-red)">备份已移出 iCloud（演示状态）</p>
      ) : null}
    </div>
  );
}

export function AlertDialogStackedDemo() {
  const [choice, setChoice] = React.useState<string>('支持 3+ 按钮自动纵向堆叠');

  return (
    <div className="flex flex-col items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="outline">
              三操作堆叠警示框
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>是否保存对文稿的更改？</AlertDialogTitle>
            <AlertDialogDescription>
              你对“macOS 27 设计规范.sketch”的修改尚未保存。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setChoice('选择了：存储并关闭')}>
              存储并关闭
            </AlertDialogAction>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setChoice('选择了：不存储')}
            >
              不存储
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setChoice('选择了：取消')}>
              取消
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-muted-foreground">{choice}</p>
    </div>
  );
}
