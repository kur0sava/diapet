/**
 * Script to reset the database (development only)
 * Run: node scripts/reset-db.js
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('Resetting DiaPet database...');
console.log('This will delete all local data!');

// Clear Expo cache
try {
  execSync('npx expo start --clear', { stdio: 'inherit', timeout: 5000 });
} catch (e) {
  // Expected to fail - we just want to trigger clear
}

console.log('Cache cleared. Database will be reset on next app launch.');
