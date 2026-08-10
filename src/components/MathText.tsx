import React from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

interface MathTextProps {
  text?: string;
  className?: string;
  inline?: boolean;
}

/**
 * Component to safely parse and render text with inline or block LaTeX mathematical notation.
 * Supports:
 * - Explicit LaTeX delimiters: $$...$$, \[...\], $...$, \(...\)
 * - Auto-detection of undelimited math equations (e.g., P(x) = x^3 + 1x - 3, x = 3, x^2, \pi, etc.)
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', inline = true }) => {
  if (!text) return null;

  // Safely render LaTeX using KaTeX
  const renderKaTeX = (mathStr: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(mathStr.trim(), {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return mathStr;
    }
  };

  // Check if text already has explicit delimiters: $, $$, \(, \[, etc.
  const delimiterRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const hasExplicitDelimiters = delimiterRegex.test(text);

  let textToParse = text;

  if (!hasExplicitDelimiters) {
    // Smart auto-formatter for plain text math notations without explicit $ delimiters:
    // 1. Equations with polynomial/algebraic terms like "P(x) = x^3 + 1x - 3" or "y = 2x^2 + 5"
    textToParse = textToParse.replace(
      /\b([A-Za-z](?:\([A-Za-z0-9, ]+\))?\s*=\s*[A-Za-z0-9_\^\+\-\*\/\s\(\)]+[\^\+\-\*\/\(][A-Za-z0-9_\^\+\-\*\/\s\(\)]+)/g,
      (match) => `$${match.trim()}$`
    );

    // 2. Simple equality like "x = 3" or "a = 15" (only if not already wrapped)
    textToParse = textToParse.replace(
      /(?<!\$)\b([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)\b(?!\$)/g,
      (match) => `$${match.trim()}$`
    );

    // 3. Expressions with exponents like "x^3", "x^2", "a^n"
    textToParse = textToParse.replace(
      /(?<!\$)\b([a-zA-Z0-9_\(\)]+\^[a-zA-Z0-9_\+\-]+)\b(?!\$)/g,
      (match) => `$${match.trim()}$`
    );

    // 4. Standalone LaTeX commands like "\pi", "\sqrt{...}", "\frac{...}{...}"
    textToParse = textToParse.replace(
      /(?<!\$)(\\\[a-zA-Z]+(?:\{[^\}]*\})*)/g,
      (match) => `$${match.trim()}$`
    );
  }

  // Parse into text and math chunks
  const chunks: { type: 'text' | 'inline-math' | 'block-math'; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const parseRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;

  while ((match = parseRegex.exec(textToParse)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ type: 'text', content: textToParse.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      chunks.push({ type: 'block-math', content: raw.slice(2, -2) });
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      chunks.push({ type: 'block-math', content: raw.slice(2, -2) });
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      chunks.push({ type: 'inline-math', content: raw.slice(2, -2) });
    } else if (raw.startsWith('$') && raw.endsWith('$')) {
      chunks.push({ type: 'inline-math', content: raw.slice(1, -1) });
    }

    lastIndex = parseRegex.lastIndex;
  }

  if (lastIndex < textToParse.length) {
    chunks.push({ type: 'text', content: textToParse.slice(lastIndex) });
  }

  if (chunks.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const ContainerTag = inline ? 'span' : 'div';

  return (
    <ContainerTag className={`math-rendered-content ${className}`}>
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'text') {
          return <React.Fragment key={idx}>{chunk.content}</React.Fragment>;
        }

        const isBlock = chunk.type === 'block-math';
        const html = renderKaTeX(chunk.content, isBlock);
        const cleanHtml = DOMPurify.sanitize(html);

        return (
          <span
            key={idx}
            className={isBlock ? 'my-3 block text-center' : 'inline-block px-0.5'}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        );
      })}
    </ContainerTag>
  );
};

export default MathText;
