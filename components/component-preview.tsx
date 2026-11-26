import * as React from 'react';
import { highlightCode } from '@/lib/highlighter';
import { DEMO_META, getDemoSourceCode } from '@/lib/demo-source';
import type { DemoName } from '@/lib/demos';
import { ComponentPreviewClient } from '@/components/component-preview-client';

export interface ComponentPreviewProps {
  name?: DemoName;
  title?: string;
  code?: string;
  mobileHeight?: number;
  tabletHeight?: number;
  className?: string;
  children?: React.ReactNode;
}

export async function ComponentPreview({
  name,
  title,
  code,
  mobileHeight,
  tabletHeight,
  className,
  children,
}: ComponentPreviewProps) {
  const meta = name ? DEMO_META[name] : undefined;
  const resolvedCode = code ?? (name ? getDemoSourceCode(name) : null);
  const highlightedLines = resolvedCode
    ? await highlightCode(resolvedCode, 'tsx')
    : null;

  return (
    <ComponentPreviewClient
      name={name}
      title={title ?? meta?.title}
      code={resolvedCode}
      highlightedLines={highlightedLines}
      mobileHeight={mobileHeight ?? meta?.mobileHeight}
      tabletHeight={tabletHeight ?? meta?.tabletHeight}
      className={className}
    >
      {children}
    </ComponentPreviewClient>
  );
}
