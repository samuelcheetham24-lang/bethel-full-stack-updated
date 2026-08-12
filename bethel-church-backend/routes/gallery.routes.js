const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDB().gallery);
});

router.post('/', requireAuth, upload.single('photo'), (req, res) => {
  const { caption } = req.body;
  if (!req.file) return res.status(400).json({ error: 'A photo file is required.' });

  const db = readDB();
  const newPhoto = {
    id: crypto.randomUUID(),
    caption: caption || '',
    imageUrl: `/uploads/${req.file.filename}`
  };
  db.gallery.push(newPhoto);
  writeDB(db);
  res.status(201).json(newPhoto);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.gallery.length;
  db.gallery = db.gallery.filter(g => g.id !== req.params.id);
  if (db.gallery.length === before) return res.status(404).json({ error: 'Photo not found.' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
