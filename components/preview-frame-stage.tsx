'use client';

import * as React from 'react';
import { LiquiBackdrop } from '@liqui-design/glass';
import { cn } from '@/lib/utils';
import { DEMO_REGISTRY, type DemoName } from '@/lib/demos';
import { PreviewScene, usePreviewSettings } from '@/components/preview-settings';

export function PreviewFrameStage({ name }: { name: DemoName }) {
  const { backdrop } = usePreviewSettings();
  const Demo = DEMO_REGISTRY[name].component;

  return (
    <LiquiBackdrop
      backdrop={<PreviewScene preset={backdrop} />}
      className={cn(
        'relative flex min-h-dvh w-full items-center justify-center p-5',
        backdrop === 'aurora' && 'dark text-white'
      )}
    >
      <div className="relative z-10 flex w-full items-center justify-center">
        <Demo />
      </div>
    </LiquiBackdrop>
  );
}
