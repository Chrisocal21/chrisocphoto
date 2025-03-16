const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get output directory from environment or default to 'dist'
const outputDir = process.env.OUTPUT_DIR || 'dist';
const publicDir = process.env.PUBLIC_DIR || 'public';

// Clean output directory if it exists
if (fs.existsSync(outputDir)) {
  try {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log(`Cleaned existing output directory: ${outputDir}`);
  } catch (error) {
    console.error(`Error cleaning directory: ${error.message}`);
  }
}

// Create output directory
try {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
} catch (error) {
  console.error(`Error creating directory: ${error.message}`);
  process.exit(1);
}

// Copy files from public to output directory
try {
  // For Windows
  if (process.platform === 'win32') {
    execSync(`xcopy /E /I /Y "${publicDir}" "${outputDir}"`);
  } else {
    // For Unix-like systems (including Vercel)
    execSync(`cp -r ${publicDir}/* ${outputDir}/`);
  }
  console.log(`Successfully copied files from ${publicDir} to ${outputDir}`);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');
