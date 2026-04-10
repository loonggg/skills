/**
 * HTML Slides to PPTX Converter
 *
 * Takes a directory of html2pptx-compatible HTML slide files
 * and converts them into a single PPTX presentation.
 *
 * Usage:
 *   node convert.js <slides-dir> <output.pptx> [--title "Title"] [--author "Author"]
 */

const fs = require('fs');
const path = require('path');

// Collect all possible node_modules locations and set NODE_PATH
// This must happen before any other require() so that html2pptx.js
// can also find playwright, sharp, etc.
const nodePaths = new Set();
const existing = (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean);
existing.forEach(p => nodePaths.add(p));

// Search from cwd and parent directories
let dir = process.cwd();
for (let i = 0; i < 6; i++) {
  const nm = path.join(dir, 'node_modules');
  if (fs.existsSync(nm)) nodePaths.add(nm);
  dir = path.dirname(dir);
}

// Add global npm lib
const globalLib = path.join(process.execPath, '..', '..', 'lib', 'node_modules');
if (fs.existsSync(globalLib)) nodePaths.add(globalLib);

// Relaunch with NODE_PATH if we found new paths
const newPath = [...nodePaths].join(path.delimiter);
if (process.env.__CONVERT_RELAUNCHED !== '1' && newPath) {
  const { execSync } = require('child_process');
  const result = execSync(
    `NODE_PATH="${newPath}" __CONVERT_RELAUNCHED=1 node "${__filename}" ${process.argv.slice(2).map(a => `"${a}"`).join(' ')}`,
    { stdio: 'inherit', env: { ...process.env, NODE_PATH: newPath, __CONVERT_RELAUNCHED: '1' } }
  );
  process.exit(0);
}

const pptxgen = require('pptxgenjs');
const html2pptx = require(path.join(__dirname, 'html2pptx'));

async function convert(slidesDir, outputPath, options = {}) {

  const pptx = new pptxgen();
  pptx.layout = options.layout || 'LAYOUT_16x9';
  pptx.title = options.title || 'Presentation';
  pptx.author = options.author || '';

  // Find slide HTML files (slide1.html, slide2.html, etc.)
  const slideFiles = fs.readdirSync(slidesDir)
    .filter(f => /^slide\d+\.html$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error(`No slide HTML files (slideN.html) found in ${slidesDir}`);
  }

  for (const file of slideFiles) {
    const htmlPath = path.join(slidesDir, file);
    console.log(`Converting ${file}...`);
    await html2pptx(htmlPath, pptx);
  }

  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nPPTX saved: ${outputPath}`);
  console.log(`Total slides: ${slideFiles.length}`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node convert.js <slides-dir> <output.pptx> [--title "Title"] [--author "Author"]');
  process.exit(1);
}

const slidesDir = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);

const titleIdx = args.indexOf('--title');
const title = titleIdx >= 0 ? args[titleIdx + 1] : 'Presentation';
const authorIdx = args.indexOf('--author');
const author = authorIdx >= 0 ? args[authorIdx + 1] : '';

convert(slidesDir, outputPath, { title, author }).catch(e => {
  console.error('Conversion failed:', e.message);
  process.exit(1);
});
