#!/usr/bin/env node

/**
 * Color Contrast Verification Script
 *
 * Verifies that AI-Born brand colors meet WCAG 2.2 AA accessibility standards.
 * Contrast ratios must be ≥4.5:1 for body text, ≥3:1 for large text.
 *
 * Run: node scripts/verify-color-contrast.js
 */

// Brand colors from CLAUDE.md
const colors = {
  obsidian: "#0a0a0f",
  cyan: "#00d9ff",
  ember: "#ff9f40",
  porcelain: "#fafafa",
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
function meetsStandard(ratio, level = "AA", size = "normal") {
  const standards = {
    AA: {
      normal: 4.5,
      large: 3.0,
    },
    AAA: {
      normal: 7.0,
      large: 4.5,
    },
  };

  return ratio >= standards[level][size];
}

/**
 * Format result output
 */
function formatResult(fg, bg, ratio) {
  const aaPass = meetsStandard(ratio, "AA", "normal");
  const aaaPass = meetsStandard(ratio, "AAA", "normal");
  const level = aaaPass ? "AAA" : aaPass ? "AA" : "FAIL";
  const symbol = aaaPass ? "✓✓✓" : aaPass ? "✓✓" : "✗";

  return `${symbol} ${fg.padEnd(12)} on ${bg.padEnd(12)} | ${ratio.toFixed(
    2
  )}:1 | ${level}`;
}

// Main execution
console.log("\n🎨 AI-Born Brand Color Contrast Verification\n");
console.log("=" .repeat(70));
console.log(
  "\nWCAG 2.2 Standards: AA ≥4.5:1 (body), AAA ≥7.0:1 (body)\n"
);

// Test combinations
const combinations = [
  { fg: "porcelain", bg: "obsidian", name: "Primary text (light on dark)" },
  { fg: "obsidian", bg: "porcelain", name: "Primary text (dark on light)" },
  { fg: "cyan", bg: "obsidian", name: "Cyan accent on dark" },
  { fg: "ember", bg: "obsidian", name: "Ember accent on dark" },
  { fg: "cyan", bg: "porcelain", name: "Cyan accent on light" },
  { fg: "ember", bg: "porcelain", name: "Ember accent on light" },
];

console.log("Color Combinations:\n");

let allPass = true;
const results = combinations.map((combo) => {
  const ratio = getContrastRatio(colors[combo.fg], colors[combo.bg]);
  const passes = meetsStandard(ratio, "AA", "normal");

  if (!passes && combo.name.includes("text")) {
    allPass = false;
  }

  return {
    ...combo,
    ratio,
    passes,
    result: formatResult(combo.fg, combo.bg, ratio),
  };
});

// Display results
results.forEach((r) => {
  console.log(r.result);
  console.log(`   Purpose: ${r.name}`);
  if (!r.passes && r.name.includes("text")) {
    console.log("   ⚠️  WARNING: Does not meet WCAG AA for body text");
  } else if (!r.passes) {
    console.log("   ℹ️  Note: Use for decorative elements only");
  }
  console.log();
});

console.log("=" .repeat(70));
console.log("\n✓ = Passes AA | ✓✓ = Passes AA | ✓✓✓ = Passes AAA\n");

// Summary
console.log("Summary:\n");
console.log(`Brand Colors:`);
console.log(`  • Obsidian: ${colors.obsidian}`);
console.log(`  • Cyan:     ${colors.cyan}`);
console.log(`  • Ember:    ${colors.ember}`);
console.log(`  • Porcelain: ${colors.porcelain}`);
console.log();

if (allPass) {
  console.log("✓ All primary text combinations meet WCAG 2.2 AA standards\n");
  process.exit(0);
} else {
  console.log("✗ Some combinations do not meet standards\n");
  process.exit(1);
}
