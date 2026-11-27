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
        'relative h-dvh w-full overflow-hidden',
        backdrop === 'aurora' && 'dark text-white'
      )}
    >
      <div className="relative z-10 size-full overflow-y-auto overscroll-contain">
        <div className="flex min-h-full w-full items-center justify-center p-5">
          <Demo />
        </div>
      </div>
    </LiquiBackdrop>
  );
}
