import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { GlobalBackdropPicker } from '@/components/preview-settings';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      sidebar={{ footer: <GlobalBackdropPicker /> }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
