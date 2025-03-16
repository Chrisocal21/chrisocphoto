const fs = require('fs');
const path = require('path');

// Check that the build output is correct
const outputDir = 'dist';

console.log('Verifying build output...');

// Check that dist directory exists
if (!fs.existsSync(outputDir)) {
  console.error(`ERROR: Output directory '${outputDir}' does not exist!`);
  process.exit(1);
}

// Check that index.html exists in the output directory
const indexPath = path.join(outputDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`ERROR: index.html not found in '${outputDir}' directory!`);
  process.exit(1);
}

// Check that CSS directory exists
const cssDir = path.join(outputDir, 'css');
if (!fs.existsSync(cssDir)) {
  console.error(`ERROR: CSS directory not found in '${outputDir}'!`);
  process.exit(1);
}

// Check that main.css exists
const cssPath = path.join(cssDir, 'main.css');
if (!fs.existsSync(cssPath)) {
  console.error(`ERROR: main.css not found in '${outputDir}/css'!`);
  process.exit(1);
}

console.log('Build output verification passed!');
console.log('The following files are ready for deployment:');
console.log(` - ${indexPath}`);
console.log(` - ${cssPath}`);
console.log(' - JS and other assets');

process.exit(0);
