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
const dal = __importStar(require("../dal"));
const router = (0, express_1.Router)();
const ADMIN_SECRET = 'admin123';
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
router.get('/verify', adminAuth, (req, res) => res.sendStatus(200));
router.get('/museums', adminAuth, async (req, res) => res.json(await dal.getAllMuseums()));
router.get('/artworks', adminAuth, async (req, res) => res.json(await dal.getAllArtworksAdmin()));
router.get('/artists', adminAuth, async (req, res) => res.json(await dal.getAllArtists()));
router.get('/styles', adminAuth, async (req, res) => res.json(await dal.getAllStyles()));
router.get('/cities', adminAuth, async (req, res) => res.json(await dal.getAllCities()));
router.get('/rooms', adminAuth, async (req, res) => res.json(await dal.getAllRooms()));
router.get('/exhibitions', adminAuth, async (req, res) => res.json(await dal.getAllExhibitionsAdmin()));
router.get('/trivia', adminAuth, async (req, res) => res.json(await dal.getAllTrivia()));
router.post('/museums', adminAuth, async (req, res) => {
    try {
        await dal.upsertMuseum(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/trivia', adminAuth, async (req, res) => {
    try {
        await dal.upsertTrivia(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/artworks', adminAuth, async (req, res) => {
    try {
        await dal.upsertArtwork(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/artists', adminAuth, async (req, res) => {
    try {
        await dal.upsertArtist(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/styles', adminAuth, async (req, res) => {
    try {
        await dal.upsertStyle(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cities', adminAuth, async (req, res) => {
    try {
        await dal.upsertCity(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/rooms', adminAuth, async (req, res) => {
    try {
        await dal.upsertRoom(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/exhibitions', adminAuth, async (req, res) => {
    try {
        await dal.upsertExhibition(req.body);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:table/:idField/:id', adminAuth, async (req, res) => {
    const { table, idField, id } = req.params;
    try {
        await dal.deleteEntity(table, idField, id);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
