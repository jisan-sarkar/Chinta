import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/cn";

export function MarkdownMessage({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none overflow-hidden text-[15px] leading-7 dark:prose-invert",
        "prose-p:my-3 prose-p:first:mt-0 prose-p:last:mb-0 prose-ul:my-3 prose-ol:my-3",
        "prose-pre:my-3 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--border)] prose-pre:bg-[#111111] prose-pre:text-sm",
        "prose-code:break-words prose-code:text-[0.92em] prose-table:my-3",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
