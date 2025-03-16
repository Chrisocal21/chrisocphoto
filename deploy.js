const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

console.log('Starting deployment to Vercel...');

async function deploy() {
  try {
    // First check if we can connect to Vercel's API
    console.log('Testing connection to Vercel API...');
    await new Promise((resolve, reject) => {
      const req = https.get('https://vercel.com/api/www/healthz', (res) => {
        if (res.statusCode === 200) {
          console.log('Connection to Vercel is working!');
          resolve();
        } else {
          reject(new Error(`Failed to connect to Vercel: HTTP status ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        reject(new Error(`Connection error: ${error.message}`));
      });
      
      req.end();
    });

    // Check if Vercel CLI is installed
    try {
      await exec('vercel --version');
      console.log('Vercel CLI is installed.');
    } catch (error) {
      console.error('Vercel CLI is not installed or not accessible.');
      console.log('Installing Vercel CLI...');
      execSync('npm install -g vercel@latest', { stdio: 'inherit' });
    }

    // Login if needed
    try {
      console.log('Checking Vercel login status...');
      await exec('vercel whoami');
      console.log('Already logged in to Vercel.');
    } catch (error) {
      console.log('Need to login to Vercel...');
      console.log('Please follow the instructions to log in:');
      execSync('vercel login', { stdio: 'inherit' });
    }
    
    // Build the project
    console.log('\nBuilding project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Deploy using an alternate method if direct deploy fails
    try {
      console.log('\nDeploying to Vercel...');
      execSync('vercel --prod', { stdio: 'inherit' });
    } catch (error) {
      console.log('Direct deployment failed. Trying alternative approach...');
      
      // Create a vercel.json if it doesn't exist
      const vercelConfigPath = path.join(__dirname, 'vercel.json');
      if (!fs.existsSync(vercelConfigPath)) {
        const config = {
          "version": 2,
          "builds": [{ "src": "package.json", "use": "@vercel/static-build" }]
        };
        fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
        console.log('Created vercel.json configuration file.');
      }
      
      // Try deploying with the --force flag
      execSync('vercel --prod --force', { stdio: 'inherit' });
    }
    
    console.log('\nDeployment complete!');
    console.log('Your site is now live at: https://chrisocphoto.vercel.app');
  } catch (error) {
    console.error('\nDeployment failed:', error.message);
    console.log('\nAlternative deployment methods:');
    console.log('1. Try deploying through the Vercel web interface: https://vercel.com/import');
    console.log('2. Push your code to GitHub and connect it to Vercel for automatic deployments');
    console.log('3. Try running these commands in a different terminal or environment');
    process.exit(1);
  }
}

deploy();
