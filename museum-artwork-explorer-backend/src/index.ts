import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { JaroWinklerDistance } from 'natural';
import * as dal from './dal';

const app = express();
const port = 3000;
const ADMIN_SECRET = 'admin123';

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Admin Protection Middleware
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-admin-secret'];
  const cleanReceived = secret ? String(secret).trim() : '';
  if (cleanReceived === ADMIN_SECRET) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
};

// --- API ROUTES ---

app.get('/api/ping', (req, res) => res.json({ status: 'alive', version: 'v2-admin-master' }));

// Public Museum
app.get('/api/museums', async (req, res) => res.json(await dal.getAllMuseums()));
app.get('/api/museums/:id', async (req, res) => {
  try {
    const data = await dal.getMuseumDetails(parseInt(req.params.id));
    if (!data) return res.status(404).json({ error: 'Museum not found' });
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public Search
app.get('/api/search/artworks', async (req, res) => {
  const query = (req.query.q as string) || '';
  try {
    const exactResults = await dal.searchArtworks(query);
    let suggestions: any[] = [];
    if (query.length > 2) {
      const allTitles = await dal.getAllArtworkTitles();
      suggestions = allTitles
        .map((item: any) => ({
          ...item,
          distance: JaroWinklerDistance(query.toLowerCase(), item.Title.toLowerCase())
        }))
        .filter((item: any) => item.distance > 0.7 && !exactResults.some((r: any) => r.ArtworkID === item.ArtworkID))
        .sort((a: any, b: any) => b.distance - a.distance)
        .slice(0, 3);
    }
    res.json({ results: exactResults, suggestions: suggestions });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/artworks/:id', async (req, res) => res.json(await dal.getArtworkDetails(parseInt(req.params.id))));
app.get('/api/exhibitions/:id', async (req, res) => res.json(await dal.getExhibitionDetails(parseInt(req.params.id))));
app.get('/api/artists/:id', async (req, res) => res.json(await dal.getArtistDetails(parseInt(req.params.id))));
app.get('/api/trivia/:type/:id', async (req, res) => res.json(await dal.getTriviaForEntity(req.params.type, parseInt(req.params.id))));
app.get('/api/popular-searches', async (req, res) => res.json((await dal.getPopularSearches(20)).map(r => r.SearchTerm)));
app.get('/api/log-search', async (req, res) => {
  await dal.logSearch(req.body.searchTerm);
  res.json({ success: true });
});

app.get('/api/daily-masterpiece', async (req, res) => {
  try {
    const data = await dal.getDailyMasterpiece();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Admin Lists
app.get('/api/admin/verify', adminAuth, (req, res) => res.sendStatus(200));
app.get('/api/admin/museums', adminAuth, async (req, res) => res.json(await dal.getAllMuseums()));
app.get('/api/admin/artworks', adminAuth, async (req, res) => res.json(await dal.getAllArtworksAdmin()));
app.get('/api/admin/artists', adminAuth, async (req, res) => res.json(await dal.getAllArtists()));
app.get('/api/admin/styles', adminAuth, async (req, res) => res.json(await dal.getAllStyles()));
app.get('/api/admin/cities', adminAuth, async (req, res) => res.json(await dal.getAllCities()));
app.get('/api/admin/rooms', adminAuth, async (req, res) => res.json(await dal.getAllRooms()));
app.get('/api/admin/exhibitions', adminAuth, async (req, res) => res.json(await dal.getAllExhibitionsAdmin()));
app.get('/api/admin/trivia', adminAuth, async (req, res) => res.json(await dal.getAllTrivia()));

// Admin Upserts
app.post('/api/admin/museums', adminAuth, async (req, res) => { await dal.upsertMuseum(req.body); res.sendStatus(200); });
app.post('/api/admin/artworks', adminAuth, async (req, res) => { await dal.upsertArtwork(req.body); res.sendStatus(200); });
app.post('/api/admin/artists', adminAuth, async (req, res) => { await dal.upsertArtist(req.body); res.sendStatus(200); });
app.post('/api/admin/styles', adminAuth, async (req, res) => { await dal.upsertStyle(req.body); res.sendStatus(200); });
app.post('/api/admin/cities', adminAuth, async (req, res) => { await dal.upsertCity(req.body); res.sendStatus(200); });
app.post('/api/admin/rooms', adminAuth, async (req, res) => { await dal.upsertRoom(req.body); res.sendStatus(200); });
app.post('/api/admin/exhibitions', adminAuth, async (req, res) => { await dal.upsertExhibition(req.body); res.sendStatus(200); });
app.post('/api/admin/trivia', adminAuth, async (req, res) => { await dal.upsertTrivia(req.body); res.sendStatus(200); });

app.delete('/api/admin/:table/:idField/:id', adminAuth, async (req, res) => {
  try {
    const { table, idField, id } = req.params;
    await dal.deleteEntity(table as string, idField as string, id as string);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

dal.initDb().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Master Admin backend at http://localhost:${port}`);
    console.log(`[PROCESS] Server is active and listening on port ${port}.`);
  });
}).catch(err => {
  console.error('[CRITICAL] Database initialization failed:', err);
  process.exit(1);
});

// Process debugging
process.on('exit', (code) => {
  console.log(`[PROCESS] Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('[PROCESS] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
});
