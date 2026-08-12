// Run this once with: npm run create-admin
// It asks for a username and password and saves them (safely hashed)
// so you can log in to manage the site's content through the API.

require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../db/connection');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise(resolve => rl.question(question, resolve));

async function main() {
  console.log('--- Create / reset the Bethel admin account ---');
  const username = (await ask('Admin username: ')).trim();
  const password = (await ask('Admin password (min 8 characters): ')).trim();

  if (!username || password.length < 8) {
    console.log('Username is required and password must be at least 8 characters. Try again.');
    rl.close();
    return;
  }

  const db = readDB();
  const passwordHash = bcrypt.hashSync(password, 10);
  const existing = db.admins.find(a => a.username === username);

  if (existing) {
    existing.passwordHash = passwordHash;
    console.log(`Password updated for admin "${username}".`);
  } else {
    db.admins.push({ id: Date.now().toString(), username, passwordHash });
    console.log(`Admin "${username}" created.`);
  }

  writeDB(db);
  rl.close();
}

main();
