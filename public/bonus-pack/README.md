# Bonus Pack Assets

This directory contains the pre-order bonus materials that are delivered to customers who submit proof of purchase.

## Required Files

Place the following files in this directory before deploying:

### 1. Agent Charter Pack
**Filename**: `agent-charter-pack.pdf`
**Type**: PDF
**Recommended Size**: ~2.5 MB
**Description**: Complete VP-agent templates and sub-agent hierarchy framework

### 2. Cognitive Overhead Index (COI) Diagnostic
**Filename**: `cognitive-overhead-index.xlsx`
**Type**: Excel Spreadsheet
**Recommended Size**: ~850 KB
**Description**: Interactive spreadsheet tool for measuring institutional drag

### 3. VP-Agent Templates
**Filename**: `vp-agent-templates.pdf`
**Type**: PDF
**Recommended Size**: ~1.2 MB
**Description**: Ready-to-use templates for top-level autonomous agents

### 4. Sub-Agent Ladders
**Filename**: `sub-agent-ladders.pdf`
**Type**: PDF
**Recommended Size**: ~980 KB
**Description**: Hierarchical agent organization patterns and delegation protocols

### 5. Escalation & Override Protocols
**Filename**: `escalation-override-protocols.pdf`
**Type**: PDF
**Recommended Size**: ~750 KB
**Description**: Human oversight frameworks and emergency intervention patterns

### 6. Implementation Guide
**Filename**: `implementation-guide.pdf`
**Type**: PDF
**Recommended Size**: ~1.5 MB
**Description**: Step-by-step setup and deployment instructions

### 7. Complete Bonus Pack (ZIP)
**Filename**: `ai-born-bonus-pack-complete.zip`
**Type**: ZIP Archive
**Recommended Size**: ~8.5 MB
**Description**: All bonus materials in a single archive

To create the ZIP file, run:
```bash
cd public/bonus-pack
zip ai-born-bonus-pack-complete.zip *.pdf *.xlsx
```

## File Specifications

- **PDF Files**: Should be print-quality, searchable text (not scanned images)
- **Excel File**: Should be compatible with Excel 2016+ and Google Sheets
- **ZIP Archive**: Should include all individual assets plus any additional README or license files
- **Total Size**: All assets should total approximately 10-12 MB

## Creating Placeholder Files (Development Only)

For development/testing, you can create placeholder files:

```bash
# Create empty placeholder files
touch agent-charter-pack.pdf
touch cognitive-overhead-index.xlsx
touch vp-agent-templates.pdf
touch sub-agent-ladders.pdf
touch escalation-override-protocols.pdf
touch implementation-guide.pdf

# Create placeholder ZIP
zip ai-born-bonus-pack-complete.zip *.pdf *.xlsx
```

**⚠️ IMPORTANT**: Replace these placeholders with real assets before production deployment!

## Naming Conventions

- Use lowercase with hyphens (kebab-case)
- Do not change filenames (they are referenced in code)
- Maintain consistent naming across all files

## Security Notes

- Files in `public/` are publicly accessible via direct URL
- Bonus pack system adds token-based security layer
- Users must have valid token (24-hour expiration) to download
- Tokens are sent via email after receipt verification

## Production Checklist

Before deploying to production:

- [ ] All 7 required files are present in this directory
- [ ] Files contain real, production-ready content (not placeholders)
- [ ] PDF files are print-quality and searchable
- [ ] Excel file opens correctly and all formulas work
- [ ] ZIP archive contains all individual assets
- [ ] Total directory size is reasonable (~10-12 MB)
- [ ] Files are readable by the web server (check permissions)
- [ ] Spot-check download links work correctly

## Testing

Test downloads locally:

```bash
# Start dev server
npm run dev

# In another terminal, test direct access (should work)
curl http://localhost:3000/bonus-pack/agent-charter-pack.pdf --output test.pdf

# Test via API (requires valid token)
curl "http://localhost:3000/api/bonus/download/agent-charter-pack?token=YOUR_TOKEN" --output test2.pdf
```

## Content Guidelines

Based on CLAUDE.md requirements, ensure:

1. **Agent Charter Pack** includes:
   - VP-agent templates
   - Sub-agent ladders
   - Escalation/override protocols

2. **COI Diagnostic** provides:
   - Interactive calculations
   - Example scenarios
   - Interpretation guidance

3. **Implementation Guide** covers:
   - Step-by-step setup process
   - Configuration examples
   - Troubleshooting tips

4. **All materials** maintain:
   - Consistent branding (AI-Born colors, fonts)
   - British English spelling
   - Professional, authoritative tone
   - Practical, actionable content

## Support

For questions about bonus pack content or asset creation:
- Contact: hello@ai-born.org
- See: /BONUS_PACK_SETUP.md for full documentation
