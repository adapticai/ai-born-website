/**
 * Create Placeholder PDF
 *
 * Generates a minimal PDF file as a placeholder for the excerpt.
 * This will be replaced with the actual book excerpt PDF later.
 */

const fs = require('fs');
const path = require('path');

const PDF_PATH = path.join(__dirname, '../public/assets/ai-born-excerpt.pdf');

// Minimal PDF structure (version 1.4)
// This creates a single-page PDF with text
const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 280
>>
stream
BT
/F1 18 Tf
50 720 Td
(AI-Born: Excerpt Coming Soon) Tj
0 -30 Td
/F1 12 Tf
(The Machine Core, the Human Cortex,) Tj
0 -20 Td
(and the Next Economy of Being) Tj
0 -40 Td
/F1 10 Tf
(by Mehran Granfar) Tj
0 -60 Td
(This is a placeholder excerpt.) Tj
0 -20 Td
(The full excerpt chapter will be available soon.) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
671
%%EOF
`;

// Write PDF file
fs.writeFileSync(PDF_PATH, pdfContent, 'binary');

console.log('✓ Placeholder PDF created successfully');
console.log('  Path:', PDF_PATH);
console.log('  Size:', fs.statSync(PDF_PATH).size, 'bytes');
console.log('\nTODO: Replace with actual book excerpt PDF');
