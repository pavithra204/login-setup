const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path    = require('path');
const fs      = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// Connect to JSON file store
const adapter = new FileSync(path.join(dbDir, 'app.db.json'));
const db      = low(adapter);

// Default schema
db.defaults({ users: [] }).write();

console.log('✅ Database initialized (lowdb → database/app.db.json)');

module.exports = db;
