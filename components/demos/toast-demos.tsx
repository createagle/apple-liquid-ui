'use client';

import * as React from 'react';
import {
  BellRingIcon,
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  Undo2Icon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Toaster, createToastManager } from '@/components/ui/toast';

export function ToastLiquidHeroDemo() {
  const manager = React.useMemo(() => createToastManager(), []);

  return (
    <Toaster toastManager={manager} position="top-right">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="default"
          onClick={() =>
            manager.add({
              title: '隔空投送接收完成',
              description: '已将“Apple_UI_Kit.fig”保存至“下载”文件夹。',
              type: 'success',
            })
          }
        >
          <BellRingIcon className="size-4" />
          发送液态通知
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            manager.add({
              title: 'iCloud 云盘已同步',
              description: '3 个最新设计稿已完成端到端加密备份。',
              type: 'info',
            })
          }
        >
          连发堆叠通知
        </Button>
      </div>
    </Toaster>
  );
}

export function ToastTypesDemo() {
  const manager = React.useMemo(() => createToastManager(), []);

  return (
    <Toaster toastManager={manager} position="top-right">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            manager.add({
              title: '导出成功',
              description: '已生成 2x Retina 预览图。',
              type: 'success',
            })
          }
        >
          <CheckCircle2Icon className="size-3.5 text-[#248A3D] dark:text-[#30D158]" />
          成功
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            manager.add({
              title: '发现系统更新',
              description: 'macOS 27.2 现已准备好安装。',
              type: 'info',
            })
          }
        >
          <InfoIcon className="size-3.5 text-(--apple-blue)" />
          信息
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            manager.add({
              title: '电池电量较低',
              description: '剩余电量 15%，建议开启低电量模式。',
              type: 'warning',
            })
          }
        >
          <TriangleAlertIcon className="size-3.5 text-[#C96B00] dark:text-[#FF9F0A]" />
          警告
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            manager.add({
              title: '同步失败',
              description: '无法连接到服务器，请检查网络设置。',
              type: 'error',
            })
          }
        >
          <OctagonAlertIcon className="size-3.5 text-[#D70015] dark:text-[#FF453A]" />
          错误
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            manager.add({
              title: '正在打包 Registry…',
              description: '请稍候，预计剩余 2 秒。',
              type: 'loading',
            })
          }
        >
          <Loader2Icon className="size-3.5" />
          加载中
        </Button>
      </div>
    </Toaster>
  );
}

export function ToastActionDemo() {
  const manager = React.useMemo(() => createToastManager(), []);
  const [restored, setRestored] = React.useState(false);

  return (
    <Toaster toastManager={manager} position="top-right">
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setRestored(false);
            manager.add({
              title: '已移至废纸篓',
              description: '“2026 产品路线图.key”已移出当前文件夹。',
              type: 'info',
              actionProps: {
                children: '撤销',
                onClick: () => {
                  setRestored(true);
                  manager.add({
                    title: '已还原文件',
                    description: '文件已恢复至原目录。',
                    type: 'success',
                  });
                },
              },
            });
          }}
        >
          <Undo2Icon className="size-4" />
          触发带操作按钮的通知
        </Button>
        {restored && (
          <span className="text-xs text-muted-foreground">
            已通过通知条操作按钮完成撤销
          </span>
        )}
      </div>
    </Toaster>
  );
}
