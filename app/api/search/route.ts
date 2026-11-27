import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

const COMPONENT_PREVIEW_RE = /^<ComponentPreview\b[^>]*\/?>$/;
const CARD_TAG_RE = /^<Card\b([\s\S]*?)\/?>$/;

function extractAttr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`));
  return match?.[1] ?? match?.[2];
}

function normalizeContent(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || COMPONENT_PREVIEW_RE.test(trimmed)) {
    return null;
  }

  const cardMatch = trimmed.match(CARD_TAG_RE);
  if (cardMatch) {
    const attrs = cardMatch[1] ?? '';
    const title = extractAttr(attrs, 'title')?.trim();
    const description = extractAttr(attrs, 'description')?.trim();
    if (title && description) return `**${title}** — ${description}`;
    if (title) return `**${title}**`;
    if (description) return description;
    return null;
  }

  return raw;
}

export const { staticGET: GET } = createFromSource(source, {
  // Zero-config multilingual tokenizer supporting Chinese, English, and mixed queries.
  language: 'multilingual',
  buildIndex(page) {
    const keywordsText = page.data.keywords?.join(' ').trim();
    const cleanedContents = page.data.structuredData.contents.flatMap((entry) => {
      const normalized = normalizeContent(entry.content);
      return normalized ? [{ ...entry, content: normalized }] : [];
    });

    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: {
        ...page.data.structuredData,
        contents: [
          ...cleanedContents,
          ...(keywordsText ? [{ heading: undefined, content: keywordsText }] : []),
        ],
      },
    };
  },
});
