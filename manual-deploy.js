const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting manual build process...');

try {
  // Build the project
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\nBuild successful! Your files are in the dist/ directory.');
    console.log('\nTo deploy manually to Vercel:');
    console.log('1. Open https://vercel.com/dashboard');
    console.log('2. Click "New Project" or go to your existing project');
    console.log('3. In the "Settings" tab, configure:');
    console.log('   - Output Directory: dist');
    console.log('   - Build Command: npm run build');
    console.log('4. Deploy your project by uploading the contents of your project directory');
    
    // Create a _redirects file for Netlify as an alternative
    const redirectsPath = path.join(distPath, '_redirects');
    fs.writeFileSync(redirectsPath, '/* /index.html 200');
    console.log('\nAlso added Netlify compatibility (_redirects file)');
    console.log('You can alternatively deploy to Netlify if Vercel continues to have issues.');
  } else {
    console.error('\nBuild failed - no dist directory was created.');
    process.exit(1);
  }
} catch (error) {
  console.error('\nBuild process failed:', error.message);
  process.exit(1);
}
