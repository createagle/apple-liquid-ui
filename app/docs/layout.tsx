import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { SidebarFooterControls } from '@/components/preview-settings';
import { MobileSearchTrigger, SidebarSearchTrigger } from '@/components/search';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const { nav } = baseOptions();

  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={nav}
      themeSwitch={{ enabled: false }}
      sidebar={{ footer: <SidebarFooterControls /> }}
      searchToggle={{
        components: {
          lg: <SidebarSearchTrigger />,
          sm: <MobileSearchTrigger />,
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
