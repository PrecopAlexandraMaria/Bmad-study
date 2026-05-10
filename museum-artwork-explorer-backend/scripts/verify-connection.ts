import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function verify() {
  try {
    console.log('Testing connection to database...');
    const pool = await sql.connect(dbConfig);
    console.log('✅ Connection successful!');

    console.log('Verifying table ArtworkSearchCount...');
    const result = await pool.request().query("SELECT * FROM sys.tables WHERE name = 'ArtworkSearchCount'");
    if (result.recordset.length > 0) {
      console.log('✅ Table ArtworkSearchCount exists.');
    } else {
      console.log('❌ Table ArtworkSearchCount does NOT exist. Run npm run setup-db.');
    }

    await pool.close();
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
}

verify();
