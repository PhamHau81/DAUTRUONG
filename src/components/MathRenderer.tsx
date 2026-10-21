import React from 'react';
import katex from 'katex';
import { normalizeMathType } from '../utils/mathParser';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

const KATEX_OPTIONS = {
  throwOnError: false,
  errorColor: '#f87171',
  macros: {
    '\\vect': '\\vec',
    '\\vector': '\\vec',
  },
};

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  // Normalize MathType and vectors before rendering
  const normalized = normalizeMathType(content || '');

  const renderFormulaWithKatex = (text: string) => {
    try {
      // Split by $$ or $
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          const html = katex.renderToString(math, { ...KATEX_OPTIONS, displayMode: true });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block my-1" />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          const html = katex.renderToString(math, { ...KATEX_OPTIONS, displayMode: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-0.5 align-middle" />;
        } else {
          return <span key={index}>{part}</span>;
        }
      });
    } catch {
      return <span>{text}</span>;
    }
  };

  return (
    <span className={`inline-math-container ${className} ${block ? 'block text-center' : ''}`}>
      {renderFormulaWithKatex(normalized)}
    </span>
  );
};
