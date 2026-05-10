import * as dal from './dal';

async function verify() {
  await dal.initDb();
  const museums = await dal.getAllMuseums();
  console.log('Museums in DB:', JSON.stringify(museums, null, 2));
  process.exit(0);
}

verify();