const { execSync } = require('child_process');
const fs = require('fs');

console.log('Deploying to Vercel...');

// Ensure we have the latest changes
try {
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Deploying to Vercel...');
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\nDeployment complete!');
  console.log('Your site is now live at: https://chrisocphoto.vercel.app');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
