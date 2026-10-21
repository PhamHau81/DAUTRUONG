/**
 * MathType & LaTeX normalization and Smart Question Parsing
 * Ensures 100% font compatibility with KaTeX without font errors
 * Special handling for Vector notations: \vec{u}, \overrightarrow{AB}, dot products, magnitudes, etc.
 */

/**
 * Normalizes vector notations in any LaTeX or MathType text
 */
export function normalizeVectors(text: string): string {
  if (!text) return '';

  let res = text;

  // 1. Unicode combining right arrow above (U+20D7) - e.g. a⃗, u⃗, AB⃗
  // Two uppercase letters with combining arrow: A⃗B⃗ or AB⃗ -> \overrightarrow{AB}
  res = res.replace(/([A-Z])\u20D7([A-Z])\u20D7/g, '\\overrightarrow{$1$2}');
  res = res.replace(/([A-Z]{2,})\u20D7/g, '\\overrightarrow{$1}');
  // Single letter/number with combining arrow: a⃗, u⃗, v⃗, 0⃗ -> \vec{a}
  res = res.replace(/([a-zA-Z0-9])\u20D7/g, '\\vec{$1}');

  // 2. Overset arrows from MathType: \overset{\to}{AB}, \overset{\rightarrow}{AB}, \overset{\longrightarrow}{AB}
  res = res.replace(/\\overset\s*\{\s*\\(?:to|rightarrow|longrightarrow|vect|vector)\s*\}\s*\{\s*([A-Za-z0-9_'\s]+?)\s*\}/g, (_, inner) => {
    const clean = inner.trim();
    return clean.length >= 2 ? `\\overrightarrow{${clean}}` : `\\vec{${clean}}`;
  });

  // 3. MathType \vect{...} or \vector{...}
  res = res.replace(/\\(?:vect|vector)\s*\{\s*([A-Za-z0-9_'\s]+?)\s*\}/g, (_, inner) => {
    const clean = inner.trim();
    return clean.length >= 2 ? `\\overrightarrow{${clean}}` : `\\vec{${clean}}`;
  });

  // 4. Subscripted single-letter vectors: \vec{u_1} -> \vec{u}_1, \vec{n_2} -> \vec{n}_2
  res = res.replace(/\\vec\s*\{\s*([a-zA-Z])_([0-9a-zA-Z]+)\s*\}/g, '\\vec{$1}_{$2}');
  res = res.replace(/\\overrightarrow\s*\{\s*([A-Za-z]{2,})_([0-9a-zA-Z]+)\s*\}/g, '\\overrightarrow{$1}_{$2}');

  // 5. Two or more uppercase letters / multi-character vectors with \vec:
  // In KaTeX, \vec{AB} only puts a short arrow over the first letter!
  // It MUST be \overrightarrow{AB} for correct standard math rendering.
  res = res.replace(/\\vec\s*\{\s*([A-Z][A-Za-z0-9_']{1,})\s*\}/g, '\\overrightarrow{$1}');

  // 6. Vector without curly braces (common in MathType plain-text exports)
  // E.g.: \vec AB -> \overrightarrow{AB}, \vec OA -> \overrightarrow{OA}
  res = res.replace(/\\vec\s+([A-Z]{2,})(?![A-Za-z0-9_'])/g, '\\overrightarrow{$1}');
  // E.g.: \vec u -> \vec{u}, \vec a -> \vec{a}, \vec 0 -> \vec{0}
  res = res.replace(/\\vec\s+([a-zA-Z0-9])(?![A-Za-z0-9_'])/g, '\\vec{$1}');

  // 7. Vector dot product: \vec{a}.\vec{b} -> \vec{a} \cdot \vec{b}
  res = res.replace(/(\\vec\{[^}]+\}|\\overrightarrow\{[^}]+\})\s*\.\s*(\\vec\{[^}]+\}|\\overrightarrow\{[^}]+\})/g, '$1 \\cdot $2');

  // 8. Vector 0 notation
  res = res.replace(/\\vec\s*\{\s*0\s*\}/g, '\\vec{0}');
  res = res.replace(/\\vec\s*\{\s*o\s*\}/gi, '\\vec{0}');

  // 9. Extra spaces inside vector braces: \vec{ a } -> \vec{a}
  res = res.replace(/\\vec\s*\{\s*([a-zA-Z0-9])\s*\}/g, '\\vec{$1}');
  res = res.replace(/\\overrightarrow\s*\{\s*([A-Za-z0-9_'\s]+?)\s*\}/g, (_, inner) => `\\overrightarrow{${inner.trim()}}`);

  return res;
}

/**
 * Normalizes raw MathType / Word / LaTeX math input:
 * - Cleans HTML/MTEF artifacts
 * - Standardizes MathType delimiters \[...\] and \(...\) to $...$
 * - Converts Unicode math symbols to KaTeX equivalents
 * - Formats all vector representations strictly and accurately
 * - Auto-wraps unwrapped formulas so KaTeX can render them
 */
export function normalizeMathType(input: string): string {
  if (!input) return '';

  let text = input;

  // 1. Clean MS Word HTML & MathType comment/metadata junk
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<annotation[\s\S]*?<\/annotation>/gi, '');
  text = text.replace(/<!--\s*MathType[\s\S]*?-->/gi, '');
  text = text.replace(/\/\*\s*MathType[\s\S]*?\*\//gi, '');
  text = text.replace(/<[^>]+>/g, ' ');

  // 2. Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // 3. Normalize MathType delimiters \[...\] and \(...\) to $...$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 4. Normalize vector expressions everywhere (in and outside math blocks)
  text = normalizeVectors(text);

  // 5. Fix common unicode math symbols to LaTeX equivalents
  text = text.replace(/√\s*(\([^\)]+\)|\w+)/g, '\\sqrt{$1}');
  text = text.replace(/√/g, '\\sqrt');
  text = text.replace(/≤/g, '\\le ');
  text = text.replace(/≥/g, '\\ge ');
  text = text.replace(/≠/g, '\\ne ');
  text = text.replace(/±/g, '\\pm ');
  text = text.replace(/×/g, '\\times ');
  text = text.replace(/÷/g, ':');
  text = text.replace(/∞/g, '\\infty ');
  text = text.replace(/∈/g, '\\in ');
  text = text.replace(/∉/g, '\\notin ');
  text = text.replace(/⊂/g, '\\subset ');
  text = text.replace(/∪/g, '\\cup ');
  text = text.replace(/∩/g, '\\cap ');
  text = text.replace(/∅/g, '\\emptyset ');
  text = text.replace(/∀/g, '\\forall ');
  text = text.replace(/∃/g, '\\exists ');
  text = text.replace(/→/g, '\\to ');
  text = text.replace(/⇒/g, '\\implies ');
  text = text.replace(/⇔/g, '\\iff ');
  text = text.replace(/⊥/g, '\\perp ');
  text = text.replace(/∥/g, '\\parallel ');
  text = text.replace(/∫/g, '\\int ');
  text = text.replace(/π/g, '\\pi ');
  text = text.replace(/α/g, '\\alpha ');
  text = text.replace(/β/g, '\\beta ');
  text = text.replace(/γ/g, '\\gamma ');
  text = text.replace(/Δ/g, '\\Delta ');
  text = text.replace(/(\d+)\s*°/g, '$1^\\circ ');

  // 6. Fix nested or double dollar issues: e.g. $$...$$ inside $...$
  text = text.replace(/\$\$\s*\$/g, '$$');
  text = text.replace(/\$\s*\$\$/g, '$$');

  // 7. Auto-wrap unwrapped standalone LaTeX expressions or vectors
  // If the text has no '$' but has LaTeX commands, wrap them or the entire expression
  if (!text.includes('$')) {
    // If the whole string looks like a formula or starts with LaTeX
    if (/^\s*\\(frac|sqrt|int|lim|vec|overrightarrow|alpha|beta|pi|sum|le|ge|ne)/.test(text)) {
      text = `$${text.trim()}$`;
    } else {
      // Find isolated LaTeX commands like \vec{u}, \overrightarrow{AB}, \frac{a}{b} and wrap them in $
      text = text.replace(/(\\(?:vec|overrightarrow|frac|sqrt|le|ge|ne)\{[^{}]+\}(?:\{[^{}]+\})?)/g, '$$$1$$');
    }
  }

  // 8. Trim and return clean text
  return text.trim();
}

export interface ParsedQuestionResult {
  content: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
}

/**
 * Smart Question Text Parser
 * Can parse questions from Word / MathType formatted text:
 * Câu 1: [Nội dung]
 * A. ...
 * B. ...
 * C. ...
 * D. ...
 * Lời giải / Hướng dẫn giải: ...
 */
export function parseQuestionFromRawText(rawText: string): ParsedQuestionResult | null {
  if (!rawText || rawText.trim().length === 0) return null;

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Try to find options: A., B., C., D. (supports A., A), A:, [A])
  const regexA = /(?:^|\n|\s)\s*(?:\[A\]|\(A\)|A[\.\:\)])\s*/i;
  const regexB = /(?:^|\n|\s)\s*(?:\[B\]|\(B\)|B[\.\:\)])\s*/i;
  const regexC = /(?:^|\n|\s)\s*(?:\[C\]|\(C\)|C[\.\:\)])\s*/i;
  const regexD = /(?:^|\n|\s)\s*(?:\[D\]|\(D\)|D[\.\:\)])\s*/i;

  const matchA = text.search(regexA);
  const matchB = text.search(regexB);
  const matchC = text.search(regexC);
  const matchD = text.search(regexD);

  if (matchA === -1 || matchB === -1 || matchC === -1 || matchD === -1) {
    // If not all 4 options detected, return standard fallback
    return {
      content: normalizeMathType(text),
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Lời giải chi tiết theo SGK Kết Nối Tri Thức Với Cuộc Sống.'
    };
  }

  // Extract Question Content
  let questionContent = text.substring(0, matchA).trim();
  // Strip leading "Câu 1:", "Bài 1:", "Q1:"
  questionContent = questionContent.replace(/^(?:Câu|Bài|Q)\s*\d+[\.\:\-]\s*/i, '');

  // Extract Option A, B, C, D
  const optA = text.substring(matchA, matchB).replace(regexA, '').trim();
  const optB = text.substring(matchB, matchC).replace(regexB, '').trim();
  const optC = text.substring(matchC, matchD).replace(regexC, '').trim();
  const restFromD = text.substring(matchD).replace(regexD, '').trim();

  // Check if there is an Explanation or Answer section after D
  const expRegex = /(?:^|\n)\s*(?:Lời giải|Hướng dẫn giải|Giải thích|Đáp án chi tiết|HDG)[\.\:\-]?\s*/i;
  const ansRegex = /(?:^|\n)\s*(?:Đáp án|Chọn)[\.\:\s]*([ABCD])/i;

  let optD = restFromD;
  let explanation = '';
  let correctAnswer: 0 | 1 | 2 | 3 = 0;

  // Check correct answer letter
  const ansMatch = text.match(ansRegex);
  if (ansMatch && ansMatch[1]) {
    const letter = ansMatch[1].toUpperCase();
    if (letter === 'A') correctAnswer = 0;
    else if (letter === 'B') correctAnswer = 1;
    else if (letter === 'C') correctAnswer = 2;
    else if (letter === 'D') correctAnswer = 3;
  }

  const expMatch = restFromD.search(expRegex);
  if (expMatch !== -1) {
    optD = restFromD.substring(0, expMatch).trim();
    explanation = restFromD.substring(expMatch).replace(expRegex, '').trim();
  }

  // If answer was in explanation like "Chọn B"
  if (explanation) {
    const expAnsMatch = explanation.match(/(?:Chọn|Đáp án)\s*([ABCD])/i);
    if (expAnsMatch && expAnsMatch[1]) {
      const letter = expAnsMatch[1].toUpperCase();
      if (letter === 'A') correctAnswer = 0;
      else if (letter === 'B') correctAnswer = 1;
      else if (letter === 'C') correctAnswer = 2;
      else if (letter === 'D') correctAnswer = 3;
    }
  }

  return {
    content: normalizeMathType(questionContent),
    options: [
      normalizeMathType(optA),
      normalizeMathType(optB),
      normalizeMathType(optC),
      normalizeMathType(optD)
    ],
    correctAnswer,
    explanation: normalizeMathType(explanation || 'Lời giải chi tiết theo SGK Kết Nối Tri Thức Với Cuộc Sống.')
  };
}
