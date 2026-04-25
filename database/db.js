const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Memory   = require('lowdb/adapters/Memory');
const path    = require('path');
const fs      = require('fs');

// Detect if running on Vercel
const isVercel = process.env.VERCEL === '1';

// Determine database path
const dbDir = path.join(__dirname);
let dbPath = path.join(dbDir, 'app.db.json');
let adapter;

try {
  if (isVercel) {
    dbPath = path.join('/tmp', 'app.db.json');
    
    if (!fs.existsSync(dbPath)) {
      const seedPath = path.join(dbDir, 'app.db.json');
      if (fs.existsSync(seedPath)) {
        fs.copyFileSync(seedPath, dbPath);
        console.log('📝 Seeded database to /tmp');
      }
    }
  } else if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  adapter = new FileSync(dbPath);
  console.log(`✅ Using FileSync adapter: ${dbPath}`);
} catch (err) {
  console.error('❌ Database initialization failed, falling back to Memory adapter:', err);
  adapter = new Memory();
}

const db = low(adapter);

// Default schema
try {
  db.defaults({ users: [] }).write();
} catch (err) {
  console.warn('⚠️ Warning: Could not write defaults to database.');
}

module.exports = db;


