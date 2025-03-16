const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get output directory from environment or use 'dist' by default
const outputDir = 'dist';
const publicDir = 'public';

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
  
  // Verify index.html was copied correctly
  if (fs.existsSync(path.join(outputDir, 'index.html'))) {
    console.log('index.html was successfully copied to output directory');
  } else {
    console.error('ERROR: index.html was not copied to output directory');
    // Try to copy it specifically
    fs.copyFileSync(
      path.join(publicDir, 'index.html'), 
      path.join(outputDir, 'index.html')
    );
    console.log('Manually copied index.html to output directory');
  }
  
  console.log(`Successfully copied files from ${publicDir} to ${outputDir}`);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');
