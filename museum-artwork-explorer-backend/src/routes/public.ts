import { Router } from 'express';
import { JaroWinklerDistance } from 'natural';
import * as dal from '../dal';

const router = Router();

router.get('/ping', (req, res) => res.json({ status: 'alive', version: 'v2-admin-master' }));

router.get('/museums', async (req, res) => res.json(await dal.getAllMuseums()));

router.get('/search/artworks', async (req, res) => {
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

    res.json({
      results: exactResults,
      suggestions: suggestions
    });
  } catch (err: any) {
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
    if (!artist) return res.status(404).send('Artist not found');
    res.json(artist);
  } catch (err) {
    res.status(500).send('Error fetching artist details');
  }
});

router.get('/popular-searches', async (req, res) => {
  const result = await dal.getPopularSearches(20);
  res.json(result.map((row: any) => row.SearchTerm));
});

router.post('/log-search', async (req, res) => {
  const { searchTerm } = req.body;
  if (!searchTerm) return res.sendStatus(400);
  await dal.logSearch(searchTerm);
  res.json({ suggestion: null });
});

export default router;
