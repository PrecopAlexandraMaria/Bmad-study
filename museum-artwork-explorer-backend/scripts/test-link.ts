import * as dal from '../src/dal';

async function test() {
  const artworks = await dal.getAllArtworksAdmin();
  console.log('Total Artworks:', artworks.length);
  
  let nullMuseums = 0;
  for (const a of artworks) {
    const details = await dal.getArtworkDetails(a.ArtworkID);
    if (!details.MuseumID) {
      nullMuseums++;
      console.log(`Artwork ID ${a.ArtworkID} ("${a.Title}") has NULL MuseumID`);
    }
  }
  console.log('Total Artworks with NULL MuseumID:', nullMuseums);
}

test().catch(console.error);
