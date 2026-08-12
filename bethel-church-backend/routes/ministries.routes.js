const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDB().ministries);
});

router.post('/', requireAuth, (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  const db = readDB();
  const newMinistry = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    icon: icon || '✨'
  };
  db.ministries.push(newMinistry);
  writeDB(db);
  res.status(201).json(newMinistry);
});

router.put('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const ministry = db.ministries.find(m => m.id === req.params.id);
  if (!ministry) return res.status(404).json({ error: 'Ministry not found.' });

  const { name, description, icon } = req.body;
  if (name) ministry.name = name;
  if (description !== undefined) ministry.description = description;
  if (icon !== undefined) ministry.icon = icon;

  writeDB(db);
  res.json(ministry);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.ministries.length;
  db.ministries = db.ministries.filter(m => m.id !== req.params.id);
  if (db.ministries.length === before) return res.status(404).json({ error: 'Ministry not found.' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
