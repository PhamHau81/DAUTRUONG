import { Question } from '../types/game';

/**
 * Word Document Exporter (.doc format with MSO Word XML & CSS Print Specs)
 * Compatible with Microsoft Word, Google Docs, WPS Office, and LibreOffice.
 * Formatted according to the standard Vietnamese Ministry of Education (MOET) test layout.
 */
export function exportQuestionsToWord(
  questions: Question[],
  examTitle: string = 'ĐỀ KIỂM TRA MÔN TOÁN THPT',
  grade: string = '12',
  lessonTitle?: string
): void {
  if (!questions || questions.length === 0) {
    alert('Không có câu hỏi nào để xuất ra Word!');
    return;
  }

  const currentDate = new Date().toLocaleDateString('vi-VN');

  // Convert LaTeX math markers into readable math text for Word printing
  const formatMathForWord = (text: string): string => {
    if (!text) return '';
    let res = text;
    // Replace \overrightarrow{AB} with AB⃗ or \vec{AB}
    res = res.replace(/\\overrightarrow\{([A-Za-z0-9_']+)\}/g, '<b>$1</b><sup>→</sup>');
    res = res.replace(/\\vec\{([A-Za-z0-9_']+)\}/g, '<b>$1</b><sup>→</sup>');
    res = res.replace(/\\cdot/g, ' · ');
    res = res.replace(/\\times/g, ' × ');
    res = res.replace(/\\le/g, ' ≤ ');
    res = res.replace(/\\ge/g, ' ≥ ');
    res = res.replace(/\\ne/g, ' ≠ ');
    res = res.replace(/\\pm/g, ' ± ');
    res = res.replace(/\\infty/g, ' ∞ ');
    res = res.replace(/\\in/g, ' ∈ ');
    res = res.replace(/\\notin/g, ' ∉ ');
    res = res.replace(/\\subset/g, ' ⊂ ');
    res = res.replace(/\\cup/g, ' ∪ ');
    res = res.replace(/\\cap/g, ' ∩ ');
    res = res.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
    res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    res = res.replace(/\\circ/g, '°');
    res = res.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
    res = res.replace(/\^([0-9a-zA-Z]+)/g, '<sup>$1</sup>');
    res = res.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
    res = res.replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>');
    // Strip $ markers
    res = res.replace(/\$\$/g, '').replace(/\$/g, '');
    return res;
  };

  const letters = ['A', 'B', 'C', 'D'];

  const questionsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;
      const formattedContent = formatMathForWord(q.content);
      const optA = formatMathForWord(q.options[0]);
      const optB = formatMathForWord(q.options[1]);
      const optC = formatMathForWord(q.options[2]);
      const optD = formatMathForWord(q.options[3]);

      return `
      <div class="question-box" style="margin-bottom: 16px; page-break-inside: avoid;">
        <p class="question-text" style="font-weight: bold; margin-bottom: 8px;">
          Câu ${qNum} <span style="font-weight: normal; font-size: 10pt; color: #555;">[${q.level || 'Thông hiểu'}]</span>: 
          <span style="font-weight: normal;">${formattedContent}</span>
        </p>
        <table class="options-table" style="width: 100%; border-collapse: collapse; margin-left: 12px; margin-bottom: 6px;">
          <tr>
            <td style="width: 50%; padding: 4px 8px; vertical-align: top;">
              <b>A.</b> ${optA}
            </td>
            <td style="width: 50%; padding: 4px 8px; vertical-align: top;">
              <b>B.</b> ${optB}
            </td>
          </tr>
          <tr>
            <td style="width: 50%; padding: 4px 8px; vertical-align: top;">
              <b>C.</b> ${optC}
            </td>
            <td style="width: 50%; padding: 4px 8px; vertical-align: top;">
              <b>D.</b> ${optD}
            </td>
          </tr>
        </table>
      </div>
      `;
    })
    .join('');

  // Answer Key Table (10 per row)
  let answerRowsHtml = '';
  const chunkSize = 10;
  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    const headerCells = chunk.map((_, idx) => `<th style="border: 1px solid #333; padding: 4px; text-align: center; background-color: #f2f2f2; width: 40px;">${i + idx + 1}</th>`).join('');
    const answerCells = chunk.map((q) => `<td style="border: 1px solid #333; padding: 4px; text-align: center; font-weight: bold; color: #c00000;">${letters[q.correctAnswer]}</td>`).join('');
    answerRowsHtml += `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11pt;">
        <tr>
          <th style="border: 1px solid #333; padding: 4px; width: 60px; background-color: #e6e6e6;">Câu</th>
          ${headerCells}
        </tr>
        <tr>
          <td style="border: 1px solid #333; padding: 4px; font-weight: bold; background-color: #e6e6e6; text-align: center;">Đ.Án</td>
          ${answerCells}
        </tr>
      </table>
    `;
  }

  // Explanations Section
  const explanationsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;
      const formattedExp = formatMathForWord(q.explanation || 'Chưa có lời giải chi tiết.');
      return `
      <div style="margin-bottom: 12px; page-break-inside: avoid;">
        <p style="margin: 0; font-size: 11pt;">
          <b>Câu ${qNum}: Chọn đáp án <span style="color: #c00000;">${letters[q.correctAnswer]}</span>.</b>
        </p>
        <p style="margin: 4px 0 0 16px; font-size: 10.5pt; color: #333; font-style: italic;">
          ${formattedExp}
        </p>
      </div>
      `;
    })
    .join('');

  const wordDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${examTitle}</title>
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 42.5pt 42.5pt 42.5pt 42.5pt; /* 1.5cm margins */
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.35;
          color: #000;
        }
        h1, h2, h3, h4 {
          margin: 0;
          font-family: 'Times New Roman', Times, serif;
        }
        p {
          margin: 0 0 6pt 0;
        }
        sup {
          font-size: 9pt;
          vertical-align: super;
        }
        sub {
          font-size: 9pt;
          vertical-align: sub;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <!-- HEADER TRƯỜNG & KỲ THI CHUẨN BỘ GIÁO DỤC -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15pt;">
          <tr>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <p style="font-size: 11pt; margin: 0; font-weight: bold; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
              <p style="font-size: 11pt; margin: 0; font-weight: bold; text-transform: uppercase;">TRƯỜNG THPT CHUYÊN</p>
              <p style="font-size: 10pt; margin: 2pt 0 0 0;">-------------------</p>
            </td>
            <td style="width: 55%; text-align: center; vertical-align: top;">
              <p style="font-size: 12pt; margin: 0; font-weight: bold; text-transform: uppercase; color: #002060;">
                ${examTitle.toUpperCase()}
              </p>
              <p style="font-size: 11pt; margin: 2pt 0 0 0; font-weight: bold;">
                MÔN: TOÁN HỌC - LỚP ${grade} (KẾT NỐI TRI THỨC)
              </p>
              ${lessonTitle ? `<p style="font-size: 10pt; margin: 2pt 0 0 0; font-style: italic;">Chuyên đề: ${lessonTitle}</p>` : ''}
              <p style="font-size: 10pt; margin: 2pt 0 0 0; font-style: italic;">
                Thời gian làm bài: ${Math.max(15, questions.length * 2)} phút (Không kể phát đề)
              </p>
            </td>
          </tr>
        </table>

        <!-- KHUNG THÔNG TIN THÍ SINH -->
        <table style="width: 100%; border: 1px dashed #444; border-collapse: collapse; margin-bottom: 15pt; background-color: #fafafa;">
          <tr>
            <td style="padding: 6pt 10pt; font-size: 11pt;">
              <b>Họ và tên thí sinh:</b> ............................................................................ 
              <b>Lớp:</b> ............... 
              <b>SBD:</b> ...................
            </td>
          </tr>
        </table>

        <!-- PHẦN I: NỘI DUNG ĐỀ THI -->
        <div style="border-bottom: 1.5pt solid #002060; margin-bottom: 10pt; padding-bottom: 3pt;">
          <h3 style="font-size: 13pt; font-weight: bold; color: #002060; text-transform: uppercase;">
            PHẦN I. CÂU HỎI TRẮC NGHIỆM (${questions.length} CÂU)
          </h3>
          <p style="font-size: 10pt; font-style: italic; color: #555; margin: 0;">
            Thí sinh chọn duy nhất một phương án đúng trong mỗi câu hỏi.
          </p>
        </div>

        ${questionsHtml}

        <div style="text-align: center; margin: 20pt 0; font-weight: bold;">
          --- HẾT PHẦN ĐỀ BÀI ---
        </div>

        <!-- NGẮT TRANG SANG BẢNG ĐÁP ÁN & LỜI GIẢI -->
        <br clear="all" style="page-break-before: always" />

        <!-- PHẦN II: BẢNG ĐÁP ÁN -->
        <div style="border-bottom: 1.5pt solid #002060; margin-bottom: 10pt; padding-bottom: 3pt;">
          <h3 style="font-size: 13pt; font-weight: bold; color: #002060; text-transform: uppercase;">
            PHẦN II. BẢNG ĐÁP ÁN CHÍNH THỨC
          </h3>
        </div>

        ${answerRowsHtml}

        <!-- PHẦN III: LỜI GIẢI CHI TIẾT -->
        <div style="border-bottom: 1.5pt solid #002060; margin-top: 20pt; margin-bottom: 10pt; padding-bottom: 3pt;">
          <h3 style="font-size: 13pt; font-weight: bold; color: #002060; text-transform: uppercase;">
            PHẦN III. HƯỚNG DẪN GIẢI CHI TIẾT TỪNG BƯỚC
          </h3>
          <p style="font-size: 10pt; font-style: italic; color: #555; margin: 0;">
            Biên soạn theo chương trình GDPT 2018 - SGK Toán Kết Nối Tri Thức Với Cuộc Sống.
          </p>
        </div>

        ${explanationsHtml}

        <div style="text-align: right; margin-top: 30pt; font-size: 10pt; font-style: italic; color: #777;">
          Xuất bản từ Đấu Trường Toán Học THPT • Ngày ${currentDate}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create Blob with UTF-8 BOM so Word opens Vietnamese characters without encoding issues
  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const cleanFileName = `De_Thi_Toan_${grade}_${Date.now()}.doc`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
