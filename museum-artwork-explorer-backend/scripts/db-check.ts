import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function verify() {
  const db = await open({
    filename: path.resolve(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('--- TABLES ---');
  console.log(tables.map((t: any) => t.name).join(', '));

  const counts: Record<string, number> = {};
  for (const table of tables) {
    const res = await db.get(`SELECT count(*) as count FROM ${table.name}`);
    counts[table.name] = res.count;
  }
  
  console.log('--- RECORD COUNTS ---');
  console.log(JSON.stringify(counts, null, 2));
}

verify().catch(console.error);
