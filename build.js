const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get output directory from environment or default to 'dist'
const outputDir = process.env.OUTPUT_DIR || 'dist';
const publicDir = process.env.PUBLIC_DIR || 'public';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

// Copy files from public to output directory
try {
  // For Windows
  if (process.platform === 'win32') {
    execSync(`xcopy /E /I /Y "${publicDir}" "${outputDir}"`);
  } else {
    // For Unix-like systems
    execSync(`cp -r ${publicDir}/* ${outputDir}/`);
  }
  console.log(`Successfully copied files from ${publicDir} to ${outputDir}`);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

console.log('Build completed successfully!');
