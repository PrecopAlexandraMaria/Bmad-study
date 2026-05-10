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

async function setup() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    console.log('Connected.');

    console.log('Creating ArtworkSearchCount table if not exists...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArtworkSearchCount')
      BEGIN
        CREATE TABLE ArtworkSearchCount (
          SearchTerm NVARCHAR(200) PRIMARY KEY,
          SearchCount INT NOT NULL DEFAULT 1
        );
        PRINT 'Table ArtworkSearchCount created.';
      END
      ELSE
      BEGIN
        PRINT 'Table ArtworkSearchCount already exists.';
      END
    `);

    await pool.close();
    console.log('Database setup complete.');
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
