const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let sqliteDb = null;

async function connectSQLite() {
  sqliteDb = await open({
    filename: process.env.SQLITE_PATH || "./faq_fallback.sqlite",
    driver: sqlite3.Database
  });

  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS user_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongo_id TEXT,
      question TEXT NOT NULL,
      answer TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      source TEXT DEFAULT 'frontend',
      promoted INTEGER DEFAULT 0,
      synced_to_mongo INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongo_id TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT DEFAULT '',
      source_query_id TEXT,
      synced_to_mongo INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongo_id TEXT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      questions_count INTEGER DEFAULT 0,
      answers_count INTEGER DEFAULT 0,
      reputation INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("SQLite fallback ready");
}

function getSQLiteDb() {
  if (!sqliteDb) {
    throw new Error("SQLite database not initialized");
  }

  return sqliteDb;
}

module.exports = {
  connectSQLite,
  getSQLiteDb
};
