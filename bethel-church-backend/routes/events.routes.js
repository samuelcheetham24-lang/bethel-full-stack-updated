const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDB().events);
});

router.post('/', requireAuth, (req, res) => {
  const { title, description, date, location } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Title and date are required.' });

  const db = readDB();
  const newEvent = {
    id: crypto.randomUUID(),
    title,
    description: description || '',
    date,
    location: location || ''
  };
  db.events.push(newEvent);
  writeDB(db);
  res.status(201).json(newEvent);
});

router.put('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const { title, description, date, location } = req.body;
  if (title) event.title = title;
  if (description !== undefined) event.description = description;
  if (date) event.date = date;
  if (location !== undefined) event.location = location;

  writeDB(db);
  res.json(event);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.events.length;
  db.events = db.events.filter(e => e.id !== req.params.id);
  if (db.events.length === before) return res.status(404).json({ error: 'Event not found.' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
