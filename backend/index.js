const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For hashing passwords
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Essential for POST requests with JSON bodies

// --- MongoDB Configuration ---
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'db_questions';
const QCM_COLLECTION = 'qcm_questions';
const INPUT_COLLECTION = 'generated_questions';
const AUDIO_COLLECTION = 'textes';
const USERS_COLLECTION = 'users'; // New collection for users
let db;

// --- Connect to Database and Start Server ---
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB.');

    db = client.db(DB_NAME);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running and accessible on your network.`);
      // You can replace the IP with your machine's local IP if you know it
      console.log(`   Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB.', error);
    process.exit(1);
  }
}

// --- API Routes ---

// --- Authentication Routes (NEW) ---

// Register a new user
app.post('/api/register', async (req, res) => {
  if (!db) return res.status(500).json({ message: 'Database not connected' });

  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection(USERS_COLLECTION).findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = {
      username,
      password: hashedPassword,
      role, // 'student' or 'teacher'
      score: null, // Default score
      status: 'Not Started', // Default status
      createdAt: new Date(),
    };

    const result = await db.collection(USERS_COLLECTION).insertOne(newUser);
    // Return user data without the password
    res.status(201).json({
      _id: result.insertedId,
      username: newUser.username,
      role: newUser.role,
      score: newUser.score,
      status: newUser.status,
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  if (!db) return res.status(500).json({ message: 'Database not connected' });

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    const user = await db.collection(USERS_COLLECTION).findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return all user data (as requested), except the password
    res.status(200).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      score: user.score,
      status: user.status,
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});


// --- Student Data Routes (NEW) ---

// Get all students (for teacher dashboard)
app.get('/api/students', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const students = await db.collection(USERS_COLLECTION)
      .find({ role: 'student' })
      .project({ password: 0 }) // Exclude password from the result
      .toArray();
    res.status(200).json(students);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

// Update a student's score
app.post('/api/students/:id/score', async (req, res) => {
  if (!db) return res.status(500).json({ message: 'Database not connected' });

  try {
    const { id } = req.params;
    const { finalResults } = req.body;

    if (!finalResults) {
      return res.status(400).json({ message: 'Score data is required' });
    }

    const result = await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          score: finalResults,
          status: 'Completed',
          completedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Score updated successfully' });

  } catch (error) {
    console.error('Failed to update score:', error);
    res.status(500).json({ message: 'Failed to update score' });
  }
});


// --- Existing Question Routes ---
app.get('/', (req, res) => res.send('Welcome to the Questions API!'));

app.get('/api/qcm-questions', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const questions = await db.collection(QCM_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch QCM questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/input-questions', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const questions = await db.collection(INPUT_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch Input questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/audio-questions', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const questions = await db.collection(AUDIO_COLLECTION).find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch audio questions:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

startServer();