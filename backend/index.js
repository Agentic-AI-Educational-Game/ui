const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
// Enable CORS for all routes, allowing your React app to connect
app.use(cors());
// Parse JSON bodies (though not needed for these GET routes, it's good practice)
app.use(express.json());

// --- MongoDB Configuration ---
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'db_questions';
const QCM_COLLECTION = 'qcm_questions';
const INPUT_COLLECTION = 'generated_questions';
const AUDIO_COLLECTION = 'audio_text';
let db; // Variable to hold the database connection

// --- Connect to Database and Start Server ---
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB.');

    db = client.db(DB_NAME);

    // Start listening for requests only after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB.', error);
    process.exit(1); // Exit the process if DB connection fails
  }
}

// --- API Routes ---

// A simple root route to check if the server is up
app.get('/', (req, res) => {
  res.send('Welcome to the Questions API!');
});

// Endpoint to fetch QCM questions
app.get('/api/qcm-questions', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const questions = await db.collection(QCM_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch QCM questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});



// Endpoint to fetch Input questions
app.get('/api/input-questions', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const questions = await db.collection(INPUT_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch Input questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


app.get('/api/audio-questions', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const questions = await db.collection(AUDIO_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch audio questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
// Start the server
startServer();