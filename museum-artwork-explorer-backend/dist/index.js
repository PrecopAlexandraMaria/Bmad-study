"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const natural_1 = require("natural");
const dal = __importStar(require("./dal"));
const app = (0, express_1.default)();
const port = 3000;
const ADMIN_SECRET = 'admin123';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Admin Protection Middleware
const adminAuth = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    const cleanReceived = secret ? String(secret).trim() : '';
    if (cleanReceived === ADMIN_SECRET) {
        next();
    }
    else {
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
        if (!data)
            return res.status(404).json({ error: 'Museum not found' });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Public Search
app.get('/api/search/artworks', async (req, res) => {
    const query = req.query.q || '';
    try {
        const exactResults = await dal.searchArtworks(query);
        let suggestions = [];
        if (query.length > 2) {
            const allTitles = await dal.getAllArtworkTitles();
            suggestions = allTitles
                .map((item) => (Object.assign(Object.assign({}, item), { distance: (0, natural_1.JaroWinklerDistance)(query.toLowerCase(), item.Title.toLowerCase()) })))
                .filter((item) => item.distance > 0.7 && !exactResults.some((r) => r.ArtworkID === item.ArtworkID))
                .sort((a, b) => b.distance - a.distance)
                .slice(0, 3);
        }
        res.json({ results: exactResults, suggestions: suggestions });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
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
    }
    catch (err) {
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
        await dal.deleteEntity(table, idField, id);
        res.sendStatus(200);
    }
    catch (err) {
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
