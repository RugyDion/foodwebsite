// generateSecret.js
const crypto = require('crypto');

// Generate a random secret
const secret = crypto.randomBytes(32).toString('hex');
console.log(`Generated secret: ${secret}`);
