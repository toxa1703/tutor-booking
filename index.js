const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Auto-create tables and seed data on startup
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tutors (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      photo_url TEXT,
      subject VARCHAR(100) NOT NULL,
      rate INTEGER NOT NULL,
      about TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
      student_name VARCHAR(100) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*) FROM tutors');
  if (rows[0].count === '0') {
    await pool.query(`
      INSERT INTO tutors (full_name, photo_url, subject, rate, about) VALUES
      ('Asel Nurova', 'https://i.pravatar.cc/300?img=47', 'Mathematics', 3000, '5 years experience preparing students for university entrance exams.'),
      ('Dmitri Kovalev', 'https://i.pravatar.cc/300?img=12', 'English', 2500, 'Native-level English. Specialises in conversational fluency and IELTS.'),
      ('Zarina Bekova', 'https://i.pravatar.cc/300?img=54', 'Physics', 3500, 'PhD student in physics. Makes complex topics visual and easy to grasp.')
    `);
  }
  console.log('Database ready');
}

initDB();

app.get('/api/tutors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tutors ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { tutor_id, student_name, phone } = req.body;
  if (!tutor_id || !student_name || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    await pool.query(
      'INSERT INTO bookings (tutor_id, student_name, phone) VALUES ($1, $2, $3)',
      [tutor_id, student_name, phone]
    );
    res.json({ success: true, message: 'Booking saved! The tutor will call you.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save booking' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));