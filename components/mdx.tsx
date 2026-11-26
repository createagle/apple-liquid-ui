import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ComponentPreview } from '@/components/component-preview';
import { Button } from '@/components/ui/button';
import {
  ButtonAllVariantsDemo,
  ButtonLiquidHeroDemo,
  ButtonOverGlassDemo,
  ButtonSizesDemo,
} from '@/components/demos/button-demos';
import {
  TabsFloatingTabBarDemo,
  TabsLineDemo,
  TabsLiquidHeroDemo,
  TabsSegmentedDemo,
  TabsVerticalDemo,
} from '@/components/demos/tabs-demos';
import {
  SelectControlledDemo,
  SelectGroupedDemo,
  SelectLiquidHeroDemo,
  SelectVariantsDemo,
} from '@/components/demos/select-demos';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    Button,
    ButtonLiquidHeroDemo,
    ButtonAllVariantsDemo,
    ButtonSizesDemo,
    ButtonOverGlassDemo,
    TabsLiquidHeroDemo,
    TabsFloatingTabBarDemo,
    TabsSegmentedDemo,
    TabsLineDemo,
    TabsVerticalDemo,
    SelectLiquidHeroDemo,
    SelectVariantsDemo,
    SelectGroupedDemo,
    SelectControlledDemo,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
