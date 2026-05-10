import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function seed() {
  const db = await open({
    filename: path.resolve(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('🏛️ Populating Museum Exhibitions...');

  const museums = await db.all('SELECT MuseumID, Name FROM Museum');
  
  const exhibitionThemes = [
    "Treasures of the Ancient World",
    "Modern Perspectives",
    "Renaissance Masterpieces",
    "The Golden Age of Art",
    "Vanguards of Change",
    "Hidden Histories",
    "Sculpting the Future",
    "Light and Shadow",
    "Colors of the Century",
    "Unseen Works"
  ];

  for (const museum of museums) {
    try {
      const theme = exhibitionThemes[Math.floor(Math.random() * exhibitionThemes.length)];
      const exhibitionName = `${theme} at ${museum.Name}`;
      
      await db.run(
        'INSERT OR IGNORE INTO Exhibition (MuseumID, Name, StartDate, EndDate) VALUES (?, ?, ?, ?)',
        museum.MuseumID,
        exhibitionName,
        '2026-05-01',
        '2026-08-31'
      );
      
      console.log(`✅ Seeded Exhibition: "${exhibitionName}"`);
    } catch (e: any) {
      console.error(`❌ Failed to seed exhibition for ${museum.Name}:`, e.message);
    }
  }

  console.log('🎉 Exhibition population complete!');
}

seed().catch(console.error);
