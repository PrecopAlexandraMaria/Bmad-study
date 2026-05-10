import express, { Request, Response } from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Configuration ---
const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
};

// Create a global connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect()
  .then(() => {
    console.log('✅ Connected to SQL Server database.');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

pool.on('error', err => {
    console.error('DB ERROR: Global pool error:', err);
});

// --- API Endpoints ---

// GET /api/popular-searches - Retrieve the top 3 most searched terms
app.get('/api/popular-searches', async (req: Request, res: Response) => {
  try {
    await poolConnect; // Ensure pool is connected
    console.log('DB: Pool ready for popular searches.');
    const result = await pool.request().query`
      SELECT TOP 3 SearchTerm
      FROM ArtworkSearchCount
      ORDER BY SearchCount DESC
    `;
    console.log('DB: Fetched popular searches:', result.recordset.map(row => row.SearchTerm));
    res.json(result.recordset.map(row => row.SearchTerm));
  } catch (err) {
    console.error('DB ERROR: Failed to fetch popular searches:', err);
    res.status(500).send('Error fetching popular searches');
  }
});

// POST /api/log-search - Log a search term and increment its count
app.post('/api/log-search', async (req: Request, res: Response) => {
  const { searchTerm } = req.body;
  console.log(`Log Search: Request received for term: "${searchTerm}"`);

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).send('Invalid search term');
  }

  try {
    await poolConnect; // Ensure pool is connected
    console.log('DB: Pool ready for logging search.');
    const query = `
      MERGE ArtworkSearchCount AS target
      USING (SELECT @searchTerm AS SearchTerm) AS source
      ON (target.SearchTerm = source.SearchTerm)
      WHEN MATCHED THEN
        UPDATE SET SearchCount = target.SearchCount + 1
      WHEN NOT MATCHED THEN
        INSERT (SearchTerm, SearchCount) VALUES (source.SearchTerm, 1);
    `;
    await pool.request()
      .input('searchTerm', sql.NVarChar, searchTerm)
      .query(query);
    console.log(`DB: Successfully logged search for "${searchTerm}".`);
    res.status(200).send('Search logged successfully');
  } catch (err) {
    console.error('DB ERROR: Failed to log search:', err);
    res.status(500).send('Error logging search');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
  console.log('--- Database connectivity enabled ---');
});
