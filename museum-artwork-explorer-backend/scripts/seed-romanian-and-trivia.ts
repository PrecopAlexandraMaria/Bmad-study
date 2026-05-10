import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function seed() {
  const db = await open({
    filename: path.resolve(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('🇷🇴 Adding Romanian Masterpieces...');

  const romaniaData = [
    { title: "Car cu boi", year: 1890, artist: "Nicolae Grigorescu", artistCountry: "Romania", birth: 1838, death: 1907, style: "Impressionism", museum: "National Museum of Art of Romania", city: "Bucharest", country: "Romania", lat: 44.4396, lng: 26.0959 },
    { title: "Anemone", year: 1916, artist: "Ștefan Luchian", artistCountry: "Romania", birth: 1868, death: 1916, style: "Post-Impressionism", museum: "National Museum of Art of Romania", city: "Bucharest", country: "Romania", lat: 44.4396, lng: 26.0959 },
    { title: "Tudor Vladimirescu", year: 1879, artist: "Theodor Aman", artistCountry: "Romania", birth: 1831, death: 1891, style: "Romanticism", museum: "National Museum of Art of Romania", city: "Bucharest", country: "Romania", lat: 44.4396, lng: 26.0959 },
    { title: "Endless Column", year: 1938, artist: "Constantin Brâncuși", artistCountry: "Romania", birth: 1876, death: 1957, style: "Modernism", museum: "Târgu Jiu Sculptural Ensemble", city: "Târgu Jiu", country: "Romania", lat: 45.0384, lng: 23.2842 },
    { title: "The Somnambulist", year: 1938, artist: "Victor Brauner", artistCountry: "Romania", birth: 1903, death: 1966, style: "Surrealism", museum: "National Museum of Art of Romania", city: "Bucharest", country: "Romania", lat: 44.4396, lng: 26.0959 }
  ];

  const n = (val: any) => val === '' || val === null || val === undefined ? null : Number(val);

  for (const item of romaniaData) {
    try {
      await db.run('INSERT OR IGNORE INTO Country (Name) VALUES (?)', item.country);
      const cRow = await db.get('SELECT CountryID FROM Country WHERE Name = ?', item.country);
      await db.run('INSERT OR IGNORE INTO City (CountryID, Name) VALUES (?, ?)', cRow.CountryID, item.city);
      const cityRow = await db.get('SELECT CityID FROM City WHERE Name = ?', item.city);
      await db.run(`INSERT OR IGNORE INTO Museum (CityID, Name, FoundedYear, Latitude, Longitude) VALUES (?, ?, ?, ?, ?)`, cityRow.CityID, item.museum, 1948, item.lat, item.lng);
      const mRow = await db.get('SELECT MuseumID FROM Museum WHERE Name = ?', item.museum);
      await db.run('INSERT OR IGNORE INTO Room (MuseumID, Name, Floor) VALUES (?, ?, ?)', mRow.MuseumID, `Hall ${item.museum}`, 1);
      const rRow = await db.get('SELECT RoomID FROM Room WHERE Name = ? AND MuseumID = ?', `Hall ${item.museum}`, mRow.MuseumID);
      await db.run('INSERT OR IGNORE INTO Artist (FullName, Country, BirthYear, DeathYear) VALUES (?, ?, ?, ?)', item.artist, item.artistCountry, item.birth, item.death);
      const aRow = await db.get('SELECT ArtistID FROM Artist WHERE FullName = ?', item.artist);
      await db.run('INSERT OR IGNORE INTO ArtStyle (Name) VALUES (?)', item.style);
      const sRow = await db.get('SELECT StyleID FROM ArtStyle WHERE Name = ?', item.style);
      await db.run('INSERT OR IGNORE INTO Artwork (ArtistID, StyleID, RoomID, Title, YearCreated) VALUES (?, ?, ?, ?, ?)', aRow.ArtistID, sRow.StyleID, rRow.RoomID, item.title, item.year);
      console.log(`✅ Added Romanian Art: ${item.title}`);
    } catch (e: any) { console.error(`❌ Romanian Art Error: ${e.message}`); }
  }

  console.log('✨ Enriching Global Trivia (3 facts per entry)...');

  // Purge existing trivia to avoid duplicates/bloat
  await db.run('DELETE FROM Trivia');

  const museumPool = [
    "Historic landmark building.", "Hidden high-security vault.", "Custom spectral lighting.", 
    "Former royal residence.", "World-class restorers.", "Ancient foundation ruins.",
    "Massive digital archives.", "Secret garden on rooftop.", "Completely solar powered.",
    "Hosts midnight tours."
  ];

  const artistPool = [
    "Hidden cryptic signatures.", "Child prodigy at ten.", "Traveled for inspiration.",
    "Rare organic pigments.", "Ciphered personal diaries.", "Multi-style master.",
    "Legacy in modern media.", "Golden hour specialist.", "Custom-made precision brushes.",
    "First show sold out."
  ];

  const artworkPool = [
    "Hidden layers beneath.", "Handcrafted oak frame.", "Twelve glaze layers.",
    "Light-shifting colors.", "Survived a major storm.", "Secret expert symbols.",
    "Artist's favorite piece.", "Three years to finish.", "Mathematical perspective.",
    "Initial critical stir."
  ];

  const getRandomFacts = (pool: string[]) => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const museums = await db.all('SELECT MuseumID FROM Museum');
  for (const m of museums) {
    const facts = getRandomFacts(museumPool);
    for (const f of facts) await db.run('INSERT INTO Trivia (EntityType, EntityID, Fact) VALUES (?, ?, ?)', 'Museum', m.MuseumID, f);
  }

  const artists = await db.all('SELECT ArtistID FROM Artist');
  for (const a of artists) {
    const facts = getRandomFacts(artistPool);
    for (const f of facts) await db.run('INSERT INTO Trivia (EntityType, EntityID, Fact) VALUES (?, ?, ?)', 'Artist', a.ArtistID, f);
  }

  const artworks = await db.all('SELECT ArtworkID FROM Artwork');
  for (const aw of artworks) {
    const facts = getRandomFacts(artworkPool);
    for (const f of facts) await db.run('INSERT INTO Trivia (EntityType, EntityID, Fact) VALUES (?, ?, ?)', 'Artwork', aw.ArtworkID, f);
  }

  console.log(`🎉 Enrichment complete. Total Trivia records: ${(museums.length + artists.length + artworks.length) * 3}`);
}

seed().catch(console.error);
