import React from 'react';

/**
 * Minimal **bold** + paragraph renderer for the LLM-written analysis text
 * (spoilage.analysis, market.analysis) that comes back from the real
 * backend. These are short markdown snippets (bold headers, numbered
 * lists as plain lines) — not full markdown documents — so a tiny custom
 * renderer avoids pulling in a full markdown-parser dependency for it.
 */
export default function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-2.5 last:mb-0 whitespace-pre-line leading-relaxed">
          {renderInline(para)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
