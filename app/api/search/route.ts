import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // Zero-config multilingual tokenizer supporting Chinese, English, and mixed queries.
  language: 'multilingual',
  buildIndex(page) {
    const keywordsText = page.data.keywords?.join(' ').trim();

    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: {
        ...page.data.structuredData,
        contents: [
          ...page.data.structuredData.contents,
          ...(keywordsText ? [{ heading: undefined, content: keywordsText }] : []),
        ],
      },
    };
  },
});
