import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { GlobalBackdropPicker } from '@/components/preview-settings';
import { MobileSearchTrigger, SidebarSearchTrigger } from '@/components/search';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      sidebar={{ footer: <GlobalBackdropPicker /> }}
      searchToggle={{
        components: {
          lg: <SidebarSearchTrigger />,
          sm: <MobileSearchTrigger />,
        },
      }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
