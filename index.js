const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET all tutors
app.get('/api/tutors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tutors ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST a new booking
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
