"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  text: string;
};

// Lightweight, dark-theme-friendly markdown for chat bubbles.
// Tabular numerals via parent .mono if needed; here we just style spacing.
export function MarkdownText({ text }: Props) {
  return (
    <div className="md-bubble">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p {...props} style={{ margin: 0 }} />,
          ul: (props) => (
            <ul
              {...props}
              style={{ margin: "6px 0", paddingLeft: 18 }}
            />
          ),
          ol: (props) => (
            <ol
              {...props}
              style={{ margin: "6px 0", paddingLeft: 18 }}
            />
          ),
          li: (props) => <li {...props} style={{ margin: "2px 0" }} />,
          h1: (props) => (
            <h3 {...props} style={{ margin: "6px 0", fontSize: 15 }} />
          ),
          h2: (props) => (
            <h3 {...props} style={{ margin: "6px 0", fontSize: 15 }} />
          ),
          h3: (props) => (
            <h3 {...props} style={{ margin: "6px 0", fontSize: 14 }} />
          ),
          code: (props) => (
            <code
              {...props}
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: 4,
                fontSize: "0.92em",
                fontFamily:
                  "'JetBrains Mono', ui-monospace, monospace",
              }}
            />
          ),
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            />
          ),
          hr: () => (
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.12)",
                margin: "8px 0",
              }}
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
