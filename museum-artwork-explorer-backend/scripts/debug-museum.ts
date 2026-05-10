import * as dal from '../src/dal';

async function test() {
  const id = 1; // Mona Lisa
  const artwork = await dal.getArtworkDetails(id);
  console.log('Artwork API Response:', JSON.stringify(artwork, null, 2));
  
  if (artwork.MuseumID) {
    const museum = await dal.getMuseumDetails(artwork.MuseumID);
    console.log('Museum API Response:', JSON.stringify(museum, null, 2));
  } else {
    console.log('MuseumID is MISSING from artwork details');
  }
}

test().catch(console.error);
