-- Run this SQL in your PostgreSQL database to set up the tables

CREATE TABLE tutors (
  id         SERIAL PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  photo_url  TEXT,
  subject    VARCHAR(100) NOT NULL,
  rate       INTEGER NOT NULL,
  about      TEXT
);

CREATE TABLE bookings (
  id           SERIAL PRIMARY KEY,
  tutor_id     INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  student_name VARCHAR(100) NOT NULL,
  phone        VARCHAR(30) NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Sample tutors
INSERT INTO tutors (full_name, photo_url, subject, rate, about) VALUES
('Asel Nurova',    'https://i.pravatar.cc/300?img=47', 'Mathematics', 3000, '5 years experience preparing students for university entrance exams. Focus on problem-solving.'),
('Dmitri Kovalev', 'https://i.pravatar.cc/300?img=12', 'English',     2500, 'Native-level English. Specialises in conversational fluency and IELTS preparation.'),
('Zarina Bekova',  'https://i.pravatar.cc/300?img=54', 'Physics',     3500, 'PhD student in physics. Makes complex topics visual and easy to grasp for any level.');
