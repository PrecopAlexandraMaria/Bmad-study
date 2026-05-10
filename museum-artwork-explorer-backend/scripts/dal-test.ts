import * as dal from '../src/dal';

async function test() {
  await dal.initDb();
  console.log('Testing DAL methods...');
  
  try {
    const m = await dal.getAllMuseums();
    console.log('Museums:', m.length);
  } catch (e: any) { console.error('Museums Error:', e.message); }

  try {
    const a = await dal.getAllArtworksAdmin();
    console.log('Artworks:', a.length);
  } catch (e: any) { console.error('Artworks Error:', e.message); }

  try {
    const t = await dal.getAllTrivia();
    console.log('Trivia:', t.length);
  } catch (e: any) { console.error('Trivia Error:', e.message); }
}

test().catch(console.error);
