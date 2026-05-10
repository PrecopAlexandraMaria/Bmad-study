import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.resolve(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    await db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export async function initDb() {
  const database = await getDb();

  // --- Force ensure Trivia exists ---
  await database.run(`
    CREATE TABLE IF NOT EXISTS Trivia (
      TriviaID INTEGER PRIMARY KEY AUTOINCREMENT,
      EntityType TEXT NOT NULL,
      EntityID INTEGER NOT NULL,
      Fact TEXT NOT NULL
    );
  `);

  // --- Schema Creation ---
  await database.exec(`
    CREATE TABLE IF NOT EXISTS Country (
        CountryID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS City (
        CityID INTEGER PRIMARY KEY AUTOINCREMENT,
        CountryID INTEGER NOT NULL,
        Name TEXT NOT NULL,
        FOREIGN KEY (CountryID) REFERENCES Country(CountryID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS Museum (
        MuseumID INTEGER PRIMARY KEY AUTOINCREMENT,
        CityID INTEGER NOT NULL,
        Name TEXT NOT NULL UNIQUE,
        FoundedYear INTEGER,
        Latitude REAL,
        Longitude REAL,
        FOREIGN KEY (CityID) REFERENCES City(CityID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS Room (
        RoomID INTEGER PRIMARY KEY AUTOINCREMENT,
        MuseumID INTEGER NOT NULL,
        Name TEXT NOT NULL,
        Floor INTEGER,
        FOREIGN KEY (MuseumID) REFERENCES Museum (MuseumID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS Artist (
        ArtistID INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL UNIQUE,
        Country TEXT,
        BirthYear INTEGER,
        DeathYear INTEGER
    );
    CREATE TABLE IF NOT EXISTS ArtStyle (
        StyleID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL UNIQUE,
        Period TEXT
    );
    CREATE TABLE IF NOT EXISTS Artwork (
        ArtworkID INTEGER PRIMARY KEY AUTOINCREMENT,
        ArtistID INTEGER NOT NULL,
        StyleID INTEGER,
        RoomID INTEGER,
        Title TEXT NOT NULL,
        YearCreated INTEGER,
        Value REAL,
        FOREIGN KEY (ArtistID) REFERENCES Artist (ArtistID) ON DELETE CASCADE,
        FOREIGN KEY (StyleID) REFERENCES ArtStyle (StyleID) ON DELETE SET NULL,
        FOREIGN KEY (RoomID) REFERENCES Room (RoomID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS Exhibition (
        ExhibitionID INTEGER PRIMARY KEY AUTOINCREMENT,
        MuseumID INTEGER NOT NULL,
        CuratorID INTEGER,
        Name TEXT NOT NULL,
        StartDate TEXT,
        EndDate TEXT,
        FOREIGN KEY (MuseumID) REFERENCES Museum (MuseumID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ArtworkExhibition (
        ArtworkID INTEGER NOT NULL,
        ExhibitionID INTEGER NOT NULL,
        PRIMARY KEY (ArtworkID, ExhibitionID),
        FOREIGN KEY (ArtworkID) REFERENCES Artwork (ArtworkID) ON DELETE CASCADE,
        FOREIGN KEY (ExhibitionID) REFERENCES Exhibition (ExhibitionID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ArtworkSearchCount (
      SearchTerm TEXT PRIMARY KEY,
      SearchCount INTEGER NOT NULL DEFAULT 1
    );
  `);

  const museumCheck = await database.get('SELECT COUNT(*) as count FROM Museum');
  if (museumCheck.count === 0) {
    await database.run('INSERT OR IGNORE INTO Country (Name) VALUES (?)', 'United Kingdom');
    const ukId = (await database.get('SELECT CountryID FROM Country WHERE Name = ?', 'United Kingdom')).CountryID;
    await database.run('INSERT OR IGNORE INTO City (CountryID, Name) VALUES (?, ?)', ukId, 'London');
    const londonId = (await database.get('SELECT CityID FROM City WHERE Name = ?', 'London')).CityID;

    await database.run(`INSERT INTO Museum (CityID, Name, FoundedYear, Latitude, Longitude) VALUES (?, ?, ?, ?, ?)`, londonId, 'The British Museum', 1753, 51.5194, -0.1270);
    const mId = (await database.get('SELECT MuseumID FROM Museum WHERE Name = ?', 'The British Museum')).MuseumID;

    await database.run('INSERT INTO Room (MuseumID, Name, Floor) VALUES (?, ?, ?)', mId, 'Gallery 101', 1);
    const rId = (await database.get('SELECT RoomID FROM Room WHERE Name = ?', 'Gallery 101')).RoomID;

    await database.run('INSERT INTO Artist (FullName, Country) VALUES (?, ?)', 'Leonardo da Vinci', 'Italy');
    const arId = (await database.get('SELECT ArtistID FROM Artist WHERE FullName = ?', 'Leonardo da Vinci')).ArtistID;

    await database.run('INSERT INTO ArtStyle (Name) VALUES (?)', 'Renaissance');
    const sId = (await database.get('SELECT StyleID FROM ArtStyle WHERE Name = ?', 'Renaissance')).StyleID;

    await database.run('INSERT INTO Artwork (ArtistID, StyleID, RoomID, Title, YearCreated) VALUES (?, ?, ?, ?, ?)', arId, sId, rId, 'Mona Lisa', 1503);
    console.log('✅ Clean Database initialized.');
  }
}

// --- Discovery & Search ---

export async function searchArtworks(query: string) {
  const database = await getDb();
  const trimmed = (query || '').trim();
  
  if (!trimmed) {
    return database.all(`
      SELECT a.*, 
             IFNULL(ar.FullName, 'Unknown Artist') as ArtistName, 
             IFNULL(m.Name, 'No Museum') as MuseumName, 
             IFNULL(s.Name, 'General Style') as StyleName
      FROM Artwork a
      LEFT JOIN Artist ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN ArtStyle s ON a.StyleID = s.StyleID
      LEFT JOIN Room r ON a.RoomID = r.RoomID
      LEFT JOIN Museum m ON r.MuseumID = m.MuseumID
      ORDER BY a.Title
    `);
  }

  const terms = trimmed.split(/\s+/).filter(t => t.length > 0);
  const conditions = terms.map(() => 'a.Title LIKE ?').join(' AND ');
  const params = terms.map(t => `%${t}%`);

  return database.all(`
    SELECT a.*, 
           IFNULL(ar.FullName, 'Unknown Artist') as ArtistName, 
           IFNULL(m.Name, 'No Museum') as MuseumName, 
           IFNULL(s.Name, 'General Style') as StyleName
    FROM Artwork a
    LEFT JOIN Artist ar ON a.ArtistID = ar.ArtistID
    LEFT JOIN ArtStyle s ON a.StyleID = s.StyleID
    LEFT JOIN Room r ON a.RoomID = r.RoomID
    LEFT JOIN Museum m ON r.MuseumID = m.MuseumID
    WHERE ${conditions}
    ORDER BY CASE WHEN a.Title LIKE ? THEN 0 ELSE 1 END, a.Title
  `, ...params, `${trimmed}%`);
}

export async function getDailyMasterpiece() {
  const database = await getDb();
  // Use a day-based seed to pick the same artwork for all users today
  const all = await database.all('SELECT ArtworkID FROM Artwork');
  if (all.length === 0) return null;
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const id = all[dayOfYear % all.length].ArtworkID;
  return getArtworkDetails(id);
}

export async function getTriviaForEntity(type: string, id: number) {
  return (await getDb()).all('SELECT Fact FROM Trivia WHERE EntityType = ? AND EntityID = ?', type, id);
}

export async function getAllMuseums() {
  return (await getDb()).all('SELECT * FROM Museum');
}

export async function getPopularSearches(limit: number = 3) {
  return (await getDb()).all(`SELECT SearchTerm FROM ArtworkSearchCount ORDER BY SearchCount DESC LIMIT ?`, limit);
}

export async function logSearch(searchTerm: string) {
  const database = await getDb();
  const term = searchTerm.trim().toLowerCase();
  await database.run('INSERT INTO ArtworkSearchCount (SearchTerm, SearchCount) VALUES (?, 1) ON CONFLICT(SearchTerm) DO UPDATE SET SearchCount = SearchCount + 1', term);
  return database.all('SELECT SearchTerm FROM ArtworkSearchCount');
}

// --- Detailed Views ---

export async function getArtworkDetails(id: number) {
  const database = await getDb();
  return database.get(`
    SELECT a.*, 
           IFNULL(ar.FullName, 'Unknown Artist') as ArtistName, 
           IFNULL(s.Name, 'General Style') as StyleName, 
           IFNULL(r.Name, 'Main Gallery') as RoomName, 
           IFNULL(r.Floor, 1) as RoomFloor, 
           IFNULL(m.Name, 'Museum') as MuseumName, 
           m.MuseumID as MuseumID
    FROM Artwork a
    LEFT JOIN Artist ar ON a.ArtistID = ar.ArtistID
    LEFT JOIN ArtStyle s ON a.StyleID = s.StyleID
    LEFT JOIN Room r ON a.RoomID = r.RoomID
    LEFT JOIN Museum m ON r.MuseumID = m.MuseumID
    WHERE a.ArtworkID = ?
  `, id);
}

export async function getMuseumDetails(id: number) {
  const database = await getDb();
  const m = await database.get('SELECT * FROM Museum WHERE MuseumID = ?', id);
  if (m) {
    const city = await database.get('SELECT Name FROM City WHERE CityID = ?', m.CityID);
    m.City = city ? city.Name : 'Unknown City';
    m.exhibitions = await database.all('SELECT * FROM Exhibition WHERE MuseumID = ?', id);
    m.artworks = await database.all(`
      SELECT a.ArtworkID, a.Title, a.YearCreated, ar.FullName as ArtistName
      FROM Artwork a
      LEFT JOIN Artist ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Room r ON a.RoomID = r.RoomID
      WHERE r.MuseumID = ?
    `, id);
  }
  return m;
}

export async function getAllArtworkTitles() {
  return (await getDb()).all('SELECT ArtworkID, Title FROM Artwork');
}

export async function getExhibitionDetails(id: number) {
  const database = await getDb();
  const e = await database.get('SELECT e.*, m.Name as MuseumName FROM Exhibition e JOIN Museum m ON e.MuseumID = m.MuseumID WHERE e.ExhibitionID = ?', id);
  if (e) e.artworks = await database.all('SELECT a.*, ar.FullName as ArtistName FROM Artwork a JOIN Artist ar ON a.ArtistID = ar.ArtistID JOIN ArtworkExhibition ae ON a.ArtworkID = ae.ArtworkID WHERE ae.ExhibitionID = ?', id);
  return e;
}

export async function getArtistDetails(id: number) {
  const database = await getDb();
  const artist = await database.get('SELECT * FROM Artist WHERE ArtistID = ?', id);
  if (artist) {
    artist.artworks = await database.all(`
      SELECT a.ArtworkID, a.Title, a.YearCreated, m.Name as MuseumName
      FROM Artwork a
      LEFT JOIN Room r ON a.RoomID = r.RoomID
      LEFT JOIN Museum m ON r.MuseumID = m.MuseumID
      WHERE a.ArtistID = ?
    `, id);
  }
  return artist;
}

// --- Admin CRUD Operations ---

export async function deleteEntity(table: string, idField: string, id: any) {
  const database = await getDb();
  const query = table === 'ArtworkSearchCount' 
    ? `DELETE FROM ArtworkSearchCount WHERE SearchTerm = ?`
    : `DELETE FROM ${table} WHERE ${idField} = ?`;
  return database.run(query, id);
}

export async function getAllArtists() { return (await getDb()).all('SELECT * FROM Artist ORDER BY FullName'); }

export async function getAllArtworksAdmin() {
  return (await getDb()).all('SELECT * FROM Artwork');
}

export async function getAllStyles() { return (await getDb()).all('SELECT * FROM ArtStyle ORDER BY Name'); }
export async function getAllCities() { return (await getDb()).all('SELECT * FROM City ORDER BY Name'); }
export async function getAllRooms() { return (await getDb()).all('SELECT r.*, IFNULL(m.Name, "Unassigned") as MuseumName FROM Room r LEFT JOIN Museum m ON r.MuseumID = m.MuseumID ORDER BY m.Name, r.Name'); }

export async function getAllExhibitionsAdmin() {
  return (await getDb()).all(`
    SELECT e.*, m.Name as MuseumName 
    FROM Exhibition e 
    JOIN Museum m ON e.MuseumID = m.MuseumID 
    ORDER BY e.StartDate DESC
  `);
}

export async function upsertExhibition(data: any) {
  const db = await getDb();
  if (data.ExhibitionID) return db.run('UPDATE Exhibition SET MuseumID = ?, Name = ?, StartDate = ?, EndDate = ? WHERE ExhibitionID = ?', data.MuseumID, data.Name, data.StartDate, data.EndDate, data.ExhibitionID);
  return db.run('INSERT INTO Exhibition (MuseumID, Name, StartDate, EndDate) VALUES (?, ?, ?, ?)', data.MuseumID, data.Name, data.StartDate, data.EndDate);
}

export async function upsertMuseum(data: any) {
  const db = await getDb();
  if (data.MuseumID) return db.run('UPDATE Museum SET CityID = ?, Name = ?, FoundedYear = ?, Latitude = ?, Longitude = ? WHERE MuseumID = ?', data.CityID, data.Name, data.FoundedYear, data.Latitude, data.Longitude, data.MuseumID);
  return db.run('INSERT INTO Museum (CityID, Name, FoundedYear, Latitude, Longitude) VALUES (?, ?, ?, ?, ?)', data.CityID, data.Name, data.FoundedYear, data.Latitude, data.Longitude);
}

export async function upsertArtwork(data: any) {
  const db = await getDb();
  if (data.ArtworkID) return db.run('UPDATE Artwork SET ArtistID = ?, StyleID = ?, RoomID = ?, Title = ?, YearCreated = ? WHERE ArtworkID = ?', data.ArtistID, data.StyleID, data.RoomID, data.Title, data.YearCreated, data.ArtworkID);
  return db.run('INSERT INTO Artwork (ArtistID, StyleID, RoomID, Title, YearCreated) VALUES (?, ?, ?, ?, ?)', data.ArtistID, data.StyleID, data.RoomID, data.Title, data.YearCreated);
}

export async function upsertArtist(data: any) {
  const db = await getDb();
  if (data.ArtistID) return db.run('UPDATE Artist SET FullName = ?, Country = ?, BirthYear = ?, DeathYear = ? WHERE ArtistID = ?', data.FullName, data.Country, data.BirthYear, data.DeathYear, data.ArtistID);
  return db.run('INSERT INTO Artist (FullName, Country, BirthYear, DeathYear) VALUES (?, ?, ?, ?)', data.FullName, data.Country, data.BirthYear, data.DeathYear);
}

export async function upsertStyle(data: any) {
  const db = await getDb();
  if (data.StyleID) return db.run('UPDATE ArtStyle SET Name = ?, Period = ? WHERE StyleID = ?', data.Name, data.Period, data.StyleID);
  return db.run('INSERT INTO ArtStyle (Name, Period) VALUES (?, ?)', data.Name, data.Period);
}

export async function upsertCity(data: any) {
  const db = await getDb();
  if (data.CityID) return db.run('UPDATE City SET Name = ?, CountryID = ? WHERE CityID = ?', data.Name, data.CountryID, data.CityID);
  return db.run('INSERT INTO City (Name, CountryID) VALUES (?, ?)', data.Name, data.CountryID);
}

export async function upsertRoom(data: any) {
  const db = await getDb();
  if (data.RoomID) return db.run('UPDATE Room SET Name = ?, Floor = ?, MuseumID = ? WHERE RoomID = ?', data.Name, data.Floor, data.MuseumID, data.RoomID);
  return db.run('INSERT INTO Room (Name, Floor, MuseumID) VALUES (?, ?, ?)', data.Name, data.Floor, data.MuseumID);
}

export async function getAllTrivia() {
  const db = await getDb();
  return db.all(`
    SELECT t.*, 
    CASE 
      WHEN t.EntityType = 'Museum' THEN (SELECT Name FROM Museum WHERE MuseumID = t.EntityID)
      WHEN t.EntityType = 'Artist' THEN (SELECT FullName FROM Artist WHERE ArtistID = t.EntityID)
      WHEN t.EntityType = 'Artwork' THEN (SELECT Title FROM Artwork WHERE ArtworkID = t.EntityID)
    END as EntityName
    FROM Trivia t
  `);
}

export async function upsertTrivia(data: any) {
  const db = await getDb();
  if (data.TriviaID) return db.run('UPDATE Trivia SET EntityType = ?, EntityID = ?, Fact = ? WHERE TriviaID = ?', data.EntityType, data.EntityID, data.Fact, data.TriviaID);
  return db.run('INSERT INTO Trivia (EntityType, EntityID, Fact) VALUES (?, ?, ?)', data.EntityType, data.EntityID, data.Fact);
}
