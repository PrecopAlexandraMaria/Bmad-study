import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function verify() {
  try {
    console.log('Testing connection to SQLite database...');
    const db = await open({
      filename: path.resolve(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    console.log('✅ Connection successful!');

    console.log('Verifying table ArtworkSearchCount...');
    const table = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ArtworkSearchCount'");
    
    if (table) {
      console.log('✅ Table ArtworkSearchCount exists.');
      const count = await db.get("SELECT COUNT(*) as count FROM ArtworkSearchCount");
      console.log(`📊 Current search terms logged: ${count.count}`);
    } else {
      console.log('❌ Table ArtworkSearchCount does NOT exist. Start the server to auto-initialize.');
    }

    await db.close();
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
