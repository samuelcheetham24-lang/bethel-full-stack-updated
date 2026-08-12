const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDB().leadership);
});

router.post('/', requireAuth, upload.single('photo'), (req, res) => {
  const { name, role, bio } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Name and role are required.' });

  const db = readDB();
  const newLeader = {
    id: crypto.randomUUID(),
    name,
    role,
    bio: bio || '',
    photoUrl: req.file ? `/uploads/${req.file.filename}` : ''
  };
  db.leadership.push(newLeader);
  writeDB(db);
  res.status(201).json(newLeader);
});

router.put('/:id', requireAuth, upload.single('photo'), (req, res) => {
  const db = readDB();
  const leader = db.leadership.find(l => l.id === req.params.id);
  if (!leader) return res.status(404).json({ error: 'Leader not found.' });

  const { name, role, bio } = req.body;
  if (name) leader.name = name;
  if (role) leader.role = role;
  if (bio !== undefined) leader.bio = bio;
  if (req.file) leader.photoUrl = `/uploads/${req.file.filename}`;

  writeDB(db);
  res.json(leader);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.leadership.length;
  db.leadership = db.leadership.filter(l => l.id !== req.params.id);
  if (db.leadership.length === before) return res.status(404).json({ error: 'Leader not found.' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
