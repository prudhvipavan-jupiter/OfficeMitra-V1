import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

interface MarkdownProps {
  children: string;
  components?: Components;
  className?: string;
}

export function Markdown({ children, components, className }: MarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} className={className}>
      {children}
    </ReactMarkdown>
  );
}

/** Heading with optional {#anchor} stripped from display text */
export function markdownHeadingId(children: ReactNode): { id: string; display: string } {
  const text = String(children);
  const display = text.replace(/\s*\{#[^}]+\}\s*$/, "");
  const id = display
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return { id, display };
}
