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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const natural_1 = require("natural");
const dal = __importStar(require("../dal"));
const router = (0, express_1.Router)();
router.get('/ping', (req, res) => res.json({ status: 'alive', version: 'v2-admin-master' }));
router.get('/museums', async (req, res) => res.json(await dal.getAllMuseums()));
router.get('/search/artworks', async (req, res) => {
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
        res.json({
            results: exactResults,
            suggestions: suggestions
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/museums/:id', async (req, res) => res.json(await dal.getMuseumDetails(parseInt(req.params.id))));
router.get('/exhibitions/:id', async (req, res) => res.json(await dal.getExhibitionDetails(parseInt(req.params.id))));
router.get('/artworks/:id', async (req, res) => res.json(await dal.getArtworkDetails(parseInt(req.params.id))));
router.get('/trivia/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    res.json(await dal.getTriviaForEntity(type, parseInt(id)));
});
router.get('/artists/:id', async (req, res) => {
    try {
        const artist = await dal.getArtistDetails(parseInt(req.params.id));
        if (!artist)
            return res.status(404).send('Artist not found');
        res.json(artist);
    }
    catch (err) {
        res.status(500).send('Error fetching artist details');
    }
});
router.get('/popular-searches', async (req, res) => {
    const result = await dal.getPopularSearches(20);
    res.json(result.map((row) => row.SearchTerm));
});
router.post('/log-search', async (req, res) => {
    const { searchTerm } = req.body;
    if (!searchTerm)
        return res.sendStatus(400);
    await dal.logSearch(searchTerm);
    res.json({ suggestion: null });
});
exports.default = router;
