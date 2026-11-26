import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Provider } from '@/components/provider';
import { cn } from '@/lib/utils';
import './global.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Apple Liquid UI',
    template: '%s | Apple Liquid UI',
  },
  description:
    '基于 shadcn/ui 构建的 Apple Liquid Glass 风格组件库，支持纯静态文档站与 shadcn Registry 一键安装。',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
