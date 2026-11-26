import { notFound } from 'next/navigation';
import { DEMO_META } from '@/lib/demo-source';
import { PreviewFrameStage } from '@/components/preview-frame-stage';
import type { DemoName } from '@/lib/demos';

export function generateStaticParams() {
  return Object.keys(DEMO_META).map((name) => ({ name }));
}

export default async function PreviewPage(
  props: PageProps<'/preview/[name]'>
) {
  const { name } = await props.params;
  if (!Object.prototype.hasOwnProperty.call(DEMO_META, name)) {
    notFound();
  }

  return <PreviewFrameStage name={name as DemoName} />;
}
