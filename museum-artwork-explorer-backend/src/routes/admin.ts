import { Request, Response, NextFunction, Router } from 'express';
import * as dal from '../dal';

const router = Router();
const ADMIN_SECRET = 'admin123';

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
  try { await dal.upsertMuseum(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/trivia', adminAuth, async (req, res) => {
  try { await dal.upsertTrivia(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/artworks', adminAuth, async (req, res) => {
  try { await dal.upsertArtwork(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/artists', adminAuth, async (req, res) => {
  try { await dal.upsertArtist(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/styles', adminAuth, async (req, res) => {
  try { await dal.upsertStyle(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/cities', adminAuth, async (req, res) => {
  try { await dal.upsertCity(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/rooms', adminAuth, async (req, res) => {
  try { await dal.upsertRoom(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/exhibitions', adminAuth, async (req, res) => {
  try { await dal.upsertExhibition(req.body); res.sendStatus(200); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:table/:idField/:id', adminAuth, async (req: Request, res: Response) => {
  const { table, idField, id } = req.params;
  try {
    await dal.deleteEntity(table as string, idField as string, id as string);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
