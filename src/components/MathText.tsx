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
 * - Unicode math symbols: ∘, √, π, ∞, ≤, ≥, ≠, ∈, ∑, ∫, ±
 * - Fraction-like expressions: (2x+3)/(4x), 1/2, g(1/2)
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', inline = true }) => {
  if (!text) return null;

  // Decode HTML entities safely so they can be processed by our regex and rendered properly by React
  const decodeHTMLEntities = (rawText: string) => {
    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(`<!doctype html><body>${rawText}`, 'text/html');
      return dom.body.textContent || rawText;
    } catch {
      return rawText;
    }
  };

  const decodedText = decodeHTMLEntities(text);

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

  // Step 1: Convert Unicode math symbols to LaTeX equivalents BEFORE delimiter detection.
  // This ensures symbols like ∘, √, π are always rendered consistently via KaTeX.
  const normalizeUnicodeMath = (raw: string): string => {
    return raw
      // BUG FIX: use \circ{} not \circ so adjacent letters don't merge into
      // an unknown command (e.g. f∘g → f\circg). The empty {} terminates the name.
      .replace(/∘/g, '\\circ{}')   // function composition ring ∘ → \circ{}
      // BUG FIX: handle √ with adjacent characters BEFORE doing bare replacement.
      // √x → \sqrt{x}, √(a+b) → \sqrt{a+b}, bare √ → \sqrt{}
      .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')  // √(expr) → \sqrt{expr}
      .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')  // √x, √21 → \sqrt{x}, \sqrt{21}
      .replace(/√/g, '\\sqrt{}')              // bare √ → \sqrt{}
      .replace(/π/g, '\\pi{}')     // pi symbol → \pi{} (safe terminator)
      .replace(/∞/g, '\\infty{}')  // infinity → \infty{}
      .replace(/≤/g, '\\leq{}')    // less-than-or-equal → \leq{}
      .replace(/≥/g, '\\geq{}')    // greater-than-or-equal → \geq{}
      .replace(/≠/g, '\\neq{}')    // not equal → \neq{}
      .replace(/∈/g, '\\in{}')     // element of → \in{}
      .replace(/∉/g, '\\notin{}')  // not element of → \notin{}
      .replace(/∑/g, '\\sum{}')    // summation → \sum{}
      .replace(/∫/g, '\\int{}')    // integral → \int{}
      .replace(/±/g, '\\pm{}')     // plus-minus → \pm{}
      .replace(/×/g, '\\times{}')  // multiplication → \times{}
      .replace(/÷/g, '\\div{}')    // division → \div{}
      .replace(/·/g, '\\cdot{}')   // middle dot → \cdot{}
      .replace(/−/g, '-');         // minus sign − (U+2212) → hyphen-minus (KaTeX compatible)
  };

  // Check if text already has explicit delimiters: $, $$, \(, \[, etc.
  const delimiterRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const hasExplicitDelimiters = delimiterRegex.test(decodedText);

  let textToParse = normalizeUnicodeMath(decodedText);

  if (!hasExplicitDelimiters) {
    // Auto-format plain text math notations. Order matters: more specific first, then general.

    // 0. PRE-NORMALIZATION for malformed LaTeX from imported data.
    //    Imported DOCX files often store √x as \sqrtx or √11 as \sqrt11 (no braces/space).
    //    Fix these BEFORE the whitelist regex so they get properly rendered.
    textToParse = textToParse
      // \sqrt followed directly by digits: \sqrt11 → \sqrt{11}
      .replace(/\\sqrt(\d+)/g, '\\sqrt{$1}')
      // \sqrt followed directly by a letter (variable): \sqrtx → \sqrt{x}
      // Use specific known command names to avoid over-matching
      .replace(/\\(sqrt)([a-zA-Z])/g, '\\$1{$2}');

    // 1. Standalone LaTeX commands: "\pi", "\sqrt{...}", "\frac{...}{...}" etc.
    //    BUG FIX: Use an explicit whitelist of known command names instead of greedy
    //    [a-zA-Z]+ so that \sqrtx is NOT treated as one unknown command.
    //    The regex also handles one level of nested braces (\sqrt{\frac{1}{2}})
    //    and space+number variants (\sqrt 3) from imported data.
    textToParse = textToParse.replace(
      /(?<![\$\\])(\\(?:sqrt|frac|binom|log|ln|exp|sin|cos|tan|cot|sec|csc|pi|circ|pm|mp|times|div|cdot|leq|geq|neq|approx|equiv|in|notin|subset|supset|cup|cap|sum|prod|int|oint|infty|lim|max|min|gcd|lcm|vec|hat|bar|dot|ddot|tilde|overline|underline|overbrace|underbrace|left|right|langle|rangle|lfloor|rfloor|lceil|rceil|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|rho|sigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|text|mathrm|mathbf|mathit|mathbb|mathcal|pmod|mod|quad|qquad|ldots|cdots|vdots|ddots|ell|partial|nabla|forall|exists|neg|land|lor|to|Rightarrow|Leftrightarrow|mapsto|perp|parallel|angle|triangle|square|circ|bullet)(?:\{(?:[^{}]|\{[^{}]*\})*\})*(?:\s+\d+(?:\.\d+)?)?)/g,
      (match) => `$${match.trim()}$`
    );

    // 2. Fraction-like division expressions:  A/B  where A and B can be parenthesised groups or variables
    //    Matches: (2x+3)/(4x), 1/2, g(1/2), x/y, (a+b)/c, etc.
    //    We guard against already-wrapped content and simple English words ("and/or").
    textToParse = textToParse.replace(
      /(?<!\$)(?<!\w)((?:\([^)]+\)|[A-Za-z0-9_]+))\/(?:(?:\([^)]+\)|[A-Za-z0-9_]+))(?!\w)(?!\$)/g,
      (match) => {
        // Skip common English "word/word" patterns like "and/or", "yes/no"
        if (/^[a-z]+\/[a-z]+$/.test(match)) return match;
        return `$${match.trim()}$`;
      }
    );

    // 3. Equations with polynomial/algebraic terms (must come before simple equality to avoid double-wrapping)
    //    e.g. "P(x) = x^3 + 1x - 3", "y = 2x^2 + 5", "(f∘g)(x) = ..."
    textToParse = textToParse.replace(
      /(?<!\$)\b([A-Za-z](?:\([A-Za-z0-9,\s\\]+\))?\s*=\s*[A-Za-z0-9_\^\+\-\*\/\s\(\)\\{}]+[\^\+\-\*\/\(\\][A-Za-z0-9_\^\+\-\*\/\s\(\)\\{}]+)/g,
      (match) => `$${match.trim()}$`
    );

    // 4. Simple equality like "x = 3" or "a = 15" (only if not already wrapped)
    textToParse = textToParse.replace(
      /(?<!\$)\b([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)\b(?!\$)/g,
      (match) => `$${match.trim()}$`
    );

    // 5. Expressions with exponents like "x^3", "x^2", "a^n" (only if not already wrapped)
    textToParse = textToParse.replace(
      /(?<!\$)\b([a-zA-Z0-9_\(\)]+\^[a-zA-Z0-9_\+\-]+)\b(?!\$)/g,
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
    return <span className={className}>{decodedText}</span>;
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

